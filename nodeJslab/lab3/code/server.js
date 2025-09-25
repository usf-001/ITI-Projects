const express = require("express");
const fs = require("fs/promises");
const path = require("path");
// const morgan = require("morgan");
const usersRouter = require("./routes/index");
const todosRouter = require("./routes/todos");

const app = express();
const port = 3000;

// app.use(morgan("tiny"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Optional home page (tries public/index.html if present)
app.get("/", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "public", "index.html");
    const content = await fs.readFile(filePath, "utf-8");
    res.send(content);
  } catch (e) {
    res.status(200).send("OK");
  }
});

// Existing users API
app.use("/users", usersRouter);

// New Todo API per lab spec (no middleware validation, as requested)
app.use("/api/todos", todosRouter);

// 404 fallthrough
app.use((req, res) => {
  res.status(404).json({ error: { message: "Not found", code: "NOT_FOUND" } });
});

// Central error handler with consistent error shape
app.use((err, req, res, next) => {
  console.error(err);
  const status = res.statusCode >= 400 ? res.statusCode : 500;
  res.status(status).json({
    error: { message: err.message || "Internal Server Error", code: "INTERNAL_ERROR" },
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});