const express = require("express");
const router = express.Router();
const pool = require("../db"); // your pg pool

// ===============================
// 1. ADD NEW ADDRESS
// ===============================
router.post("/add", async (req, res) => {
  try {
    const {
      user_id,
      label,
      name,
      phone,
      line1,
      city,
      state,
      pincode,
      is_default,
    } = req.body;

    if (!user_id || !line1) {
      return res.status(400).json({ error: "user_id and line1 required" });
    }

    // If setting default → remove old default
    if (is_default) {
      await pool.query(
        `UPDATE pantix_useraddresses
         SET is_default = FALSE
         WHERE user_id = $1`,
        [user_id]
      );
    }

    const result = await pool.query(
      `INSERT INTO pantix_useraddresses
      (user_id, label, name, phone, line1, city, state, pincode, is_default)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        user_id,
        label,
        name,
        phone,
        line1,
        city,
        state,
        pincode,
        is_default || false,
      ]
    );

    res.json({
      success: true,
      address: result.rows[0],
    });
  } catch (err) {
    console.error("ADD ADDRESS ERROR:", err);
    res.status(500).json({ error: "Failed to add address" });
  }
});

// ===============================
// 2. GET ADDRESSES BY USER ID
// ===============================
router.get("/user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM pantix_useraddresses
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [user_id]
    );

    res.json({
      success: true,
      addresses: result.rows,
    });
  } catch (err) {
    console.error("GET ADDRESS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
});

// ===============================
// 3. DELETE ADDRESS (optional)
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `DELETE FROM pantix_useraddresses WHERE id = $1`,
      [id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE ADDRESS ERROR:", err);
    res.status(500).json({ error: "Failed to delete address" });
  }
});

// ===============================
// 4. SET DEFAULT ADDRESS
// ===============================
router.put("/default/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const address = await pool.query(
      `SELECT user_id FROM pantix_useraddresses WHERE id = $1`,
      [id]
    );

    if (!address.rows.length) {
      return res.status(404).json({ error: "Address not found" });
    }

    const user_id = address.rows[0].user_id;

    await pool.query(
      `UPDATE pantix_useraddresses
       SET is_default = FALSE
       WHERE user_id = $1`,
      [user_id]
    );

    await pool.query(
      `UPDATE pantix_useraddresses
       SET is_default = TRUE
       WHERE id = $1`,
      [id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("SET DEFAULT ERROR:", err);
    res.status(500).json({ error: "Failed to set default address" });
  }
});

module.exports = router;