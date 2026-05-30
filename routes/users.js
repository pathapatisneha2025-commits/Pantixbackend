const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");

/* ======================================================
   REGISTER USER
====================================================== */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user exists
    const userCheck = await pool.query(
      `SELECT * FROM pantrixusers WHERE email=$1`,
      [email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user
    const result = await pool.query(
      `INSERT INTO pantrixusers (name, email, password)
       VALUES ($1,$2,$3)
       RETURNING id, name, email, created_at`,
      [name, email, hashedPassword]
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }


  
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userRes = await pool.query(
      `SELECT * FROM pantrixusers WHERE email=$1`,
      [email]
    );

    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = userRes.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, created_at FROM pantrixusers`
    );

    res.json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, name, email, created_at 
       FROM pantrixusers 
       WHERE id=$1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;