const express = require("express");
const router = express.Router();
const pool = require("../db");

/* ======================================================
   ADD TO WISHLIST
====================================================== */
router.post("/add", async (req, res) => {
  try {
    const { user_id, product_id } = req.body;

    if (!user_id || !product_id) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    await pool.query(
      `INSERT INTO pantix_userwishlist (user_id, product_id, created_at)
       VALUES ($1, $2, NOW())`,
      [user_id, product_id]
    );

    res.json({ success: true, message: "Added to wishlist" });
  } catch (err) {
    console.error("Add wishlist error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/* ======================================================
   REMOVE FROM WISHLIST
====================================================== */
router.post("/remove", async (req, res) => {
  try {
    const { user_id, product_id } = req.body;

    if (!user_id || !product_id) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    await pool.query(
      `DELETE FROM pantix_userwishlist
       WHERE user_id = $1 AND product_id = $2`,
      [user_id, product_id]
    );

    res.json({ success: true, message: "Removed from wishlist" });
  } catch (err) {
    console.error("Remove wishlist error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/* ======================================================
   GET WISHLIST BY USER ID
====================================================== */
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `SELECT product_id
       FROM pantix_userwishlist
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user_id]
    );

    res.json({
      success: true,
      wishlist: result.rows.map((r) => r.product_id),
    });
  } catch (err) {
    console.error("Get wishlist error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;