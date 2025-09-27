const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { query } = require("../DB");

function auth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Missing token" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, "secretkeygfsgd", (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
}

router.get("/", auth, async (req, res, next) => {
  try {
    const users = await query("SELECT id, name, email, age, created_at FROM users WHERE id=?", [req.user.id]);
    res.json(users[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
