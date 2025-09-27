const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { query } = require("../DB");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  age: Joi.number().min(13).max(120).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

router.post("/register", async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, email, password, age } = req.body;
    const existing = await query("SELECT * FROM users WHERE email=?", [email]);
    if (existing.length) return res.status(409).json({ error: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const result = await query(
      "INSERT INTO users (name, email, password_hash, age) VALUES (?, ?, ?, ?)",
      [name, email, hashed, age]
    );

    res.status(201).json({ id: result.insertId, name, email, age });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = req.body;
    const users = await query("SELECT * FROM users WHERE email=?", [email]);
    if (!users.length) return res.status(401).json({ error: "Invalid credentials" });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, "secretkeygfsgd", { expiresIn: "1h" });
    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
