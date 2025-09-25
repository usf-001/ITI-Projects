const express = require("express");
const router = express.Router();
const fs = require("fs/promises");
const path = require("path");
router.get("/", async (req, res) => {
  try {
    const dataPath = path.join(__dirname, '../users.json')
    const users = await fs.readFile(dataPath, "utf-8");
    console.log("🚀 ~ users:", users);

    const parsedUsers = JSON.parse(users);
    res.send(parsedUsers);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.status(404).send({ error: "no users found" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    const { id } = req.params;
    const users = await fs.readFile("users.json");
    const parsedUsers = JSON.parse(users);
    const user = parsedUsers.find((u) => u.id === parseInt(id));
    if (!user) {
      res.status(404).send({ error: "user not found" });
    }
    res.send(user);
  } catch (error) {
    res.status(400).send({ error: "bad request" });
  }
});

module.exports = router;
