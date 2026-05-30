const express = require("express");
const router = express.Router();
const pool = require("./db");
const auth = require("./auth");

// CREATE ORDER
router.post("/place_order", auth, async (req, res) => {
  try {
    const {
      items,
      total,
      payment,
      address,
      reseller_id,
      reseller_commission,
    } = req.body;

    const user_id = req.user.id;

    const result = await pool.query(
      `INSERT INTO pantix_orders 
      (user_id, items, total, payment, address, reseller_id, reseller_commission)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [
        user_id,
        JSON.stringify(items),
        total,
        payment,
        JSON.stringify(address),
        reseller_id || null,
        reseller_commission || 0,
      ]
    );

    res.json({
      success: true,
      order: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// GET USER ORDERS
router.get("/:user_id", auth, async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM pantix_orders 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [user_id]
    );

    res.json({
      success: true,
      orders: result.rows,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

module.exports = router;