const express = require("express");
const app = express();
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the API" });
});

app.use("/auth", authRouter);
app.use("/profile", profileRouter);

app.use((err, req, res, next) => {
  console.error(err);
  if (err.status) {
    res.status(err.status).json({ error: err.message });
  } else {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(3000, () => console.log("API running on http://localhost:3000"));
