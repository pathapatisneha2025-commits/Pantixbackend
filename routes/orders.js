const express = require("express");
const router = express.Router();
const pool = require("../db");

//
// ✅ CREATE ORDER
//
router.post("/place_order", async (req, res) => {
  try {
    const {
      user_id,
      items,
      total,
      payment,
      address,
      reseller_id,
      reseller_commission,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

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
      id: result.rows[0].id,
    });
  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

//
// ✅ GET ALL ORDERS (ADMIN DEBUG)
//
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM pantix_orders ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      orders: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

//
// ✅ GET ORDERS BY USER ID
//
router.get("/user/:user_id", async (req, res) => {
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
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
});

//
// ✅ GET SINGLE ORDER
//
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM pantix_orders WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      success: true,
      order: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

//
// ✅ UPDATE ORDER STATUS
//
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE pantix_orders 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    res.json({
      success: true,
      order: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

module.exports = router;