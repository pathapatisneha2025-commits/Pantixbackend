const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/add", async (req, res) => {
  try {
    const {
      user_id,
      product_id,
      size,
      color,
      qty = 1,
      reseller_id,
      reseller_margin = 0,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO  pantixcart (
        user_id,
        product_id,
        size,
        color,
        qty,
        reseller_id,
        reseller_margin
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (user_id, product_id, size, color)
      DO UPDATE SET
        qty = cart.qty + EXCLUDED.qty,
        updated_at = NOW()
      RETURNING *;
      `,
      [
        user_id,
        product_id,
        size,
        color,
        qty,
        reseller_id || null,
        reseller_margin,
      ]
    );

    res.json({
      success: true,
      message: "Item added to cart",
      cartItem: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Failed to add item to cart",
    });
  }
});

router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM  pantixcart WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );

    res.json({
      success: true,
      items: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch cart",
    });
  }
});

router.delete("/remove", async (req, res) => {
  try {
    const { user_id, product_id, size, color } = req.body;

    await pool.query(
      `
      DELETE FROM  pantixcart
      WHERE user_id = $1
      AND product_id = $2
      AND size = $3
      AND color = $4
      `,
      [user_id, product_id, size, color]
    );

    res.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Failed to remove item",
    });
  }
});
router.put("/update", async (req, res) => {
  try {
    const { user_id, product_id, size, color, qty } = req.body;

    const result = await pool.query(
      `
      UPDATE  pantixcart
      SET qty = $5,
          updated_at = NOW()
      WHERE user_id = $1
      AND product_id = $2
      AND size = $3
      AND color = $4
      RETURNING *;
      `,
      [user_id, product_id, size, color, qty]
    );

    res.json({
      success: true,
      item: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Failed to update cart",
    });
  }
});
router.delete("/delete/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    await pool.query(`DELETE FROM  pantixcart WHERE user_id = $1`, [user_id]);

    res.json({
      success: true,
      message: "Cart cleared",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Failed to clear cart",
    });
  }
});
module.exports = router;