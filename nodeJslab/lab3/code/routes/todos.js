const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/todos.json');

async function readTodos() {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeTodos(items) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2), 'utf-8');
}

// GET /api/todos
router.get('/', async (req, res, next) => {
  try {
    const items = await readTodos();
    res.status(200).json({ items, total: items.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/todos/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const items = await readTodos();
    const todo = items.find(t => String(t.id) === String(id));
    if (!todo) {
      return res.status(404).json({ error: { message: 'Todo not found', code: 'NOT_FOUND' } });
    }
    res.status(200).json(todo);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/todos/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const items = await readTodos();
    const idx = items.findIndex(t => String(t.id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ error: { message: 'Todo not found', code: 'NOT_FOUND' } });
    }
    items.splice(idx, 1);
    await writeTodos(items);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;