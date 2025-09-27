const express = require("express");
const router = express.Router();
const fs = require("fs/promises");
const path = require("path");
const { query } = require("../helpers/DB");
const bcrypt = require("bcrypt");
const { error } = require("console");
const _ = require("loadsh");
const jwt = require("jsonwebtoken");
const joi = require('joi');
// let users;
let dataPath;
(async () => {
  dataPath = path.join(__dirname, "../users.json");
  // const Users = await fs.readFile(dataPath, "utf-8");
  // users = JSON.parse(Users);
})();

const schema = joi.object({
    name: joi.string().min(3).max(30).required(),
    password: joi.string().min(3).max(30).required(),
});

router.get("/", async (req, res) => {
  try {
    const { name } = req.query;
    console.log("🚀 ~ name:", name);

    if (!name) {
      const users = await query("SELECT * from users;");
      res.send(users);
      return;
    }
    const user = await query("select * from users where name=?", [name]);
    // const user = users.filter((u) => u.name === name);
    res.send(user);
    return;
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.status(404).send({ error: "no users found" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const { name, password } = req.query;
    const { id } = req.params;
    const user = await query("select * from users where id =?", [id]);

    if (user[0].name === name) {
      const compare = await bcrypt.compare(password, user[0].password);
      if (compare) {
        const token = jwt.sign({ name }, "secretkeygfsgd", { expiresIn: "1h" });
        console.log("🚀 ~ token:", token);
        res.send({ token });
        return;
      }
      res.status(401).send({ error: "Unathuraized" });
      return;
    }
    // const user = users.find((u) => u.id === parseInt(id));
    if (!user || !user?.length) {
      res.status(404).send({ error: "user not found" });
    }
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.status(400).send({ error: "bad request" });
  }
});

router.post("/", async (req, res) => {
  console.log("body: ", req.body);
  const { error } = schema.validate(req.body);
  if (error) {
        return res.status(400).json({
            error: error.details[0].message
        });
    }

  const { name, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 1);
  const result = await query(
    "insert into users (name, password) values(?, ?)",
    [name, hashedPassword]
  );
  console.log("🚀 ~ result:", result);
  // console.log("🚀 ~ newUser:", result);
  // const newUser = {
  //   id: new Date(),
  //   name,
  // };
  // users.push(newUser);
  // await fs.writeFile(dataPath, JSON.stringify(users, null, 2));

  res.send({ created: result.affectedRows });
});

module.exports = router;
