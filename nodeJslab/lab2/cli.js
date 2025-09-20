
import { Command } from "commander";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const program = new Command();
program.name("users").description("Users manager").version("2.0.0");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB = path.join(__dirname, "users.json");

async function readDB() {
  const raw = await fs.readFile(DB, "utf-8");
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : [];
}
async function writeDB(arr) {
  await fs.writeFile(DB, JSON.stringify(arr, null, 2));
}
function table(rows) {
  if (!rows.length) {
    console.log("∅ no users");
    return;
  }
  const cols = ["id", "Name"];
  const w = cols.map((c) => Math.max(c.length, ...rows.map((r) => String(r[c]).length)));
  const line = (vals) => vals.map((v, i) => String(v).padEnd(w[i])).join("  ");
  console.log(line(cols));
  console.log(w.map((n) => "─".repeat(n)).join("  "));
  rows.forEach((r) => console.log(line([r.id, r.Name])));
}

program
  .command("getone <id>")
  .description("Get a user by ID")
  .action(async (id) => {
    const data = await readDB();
    const user = data.find((u) => u.id === parseInt(id, 10));
    console.log(user ? JSON.stringify(user) : "not found");
  });

program
  .command("getall")
  .description("Get all users")
  .action(async () => {
    const data = await readDB();
    table(data); 
  });

program
  .command("add <name...>")
  .description("Add a new user")
  .action(async (nameParts) => {
    const name = Array.isArray(nameParts) ? nameParts.join(" ").trim() : String(nameParts);
    if (!name) {
      console.error("usage: add <name>");
      process.exit(1);
    }
    const data = await readDB();
   
    const newUser = { id: Date.now(), Name: name };
    data.push(newUser);
    await writeDB(data);
    console.log(`ok: added #${newUser.id} "${newUser.Name}"`);
  });

program
  .command("remove <id>")
  .description("Remove a user by ID")
  .action(async (id) => {
    const data = await readDB();
    const before = data.length;
    const filtered = data.filter((u) => u.id !== parseInt(id, 10));
    if (filtered.length === before) {
      console.log("not found");
      return;
    }
    await writeDB(filtered);
    console.log(`ok: removed #${id}`);
  });

program
  .command("edit <id> <newName...>")
  .description("Edit a user by ID")
  .action(async (id, nameParts) => {
    const newName = (Array.isArray(nameParts) ? nameParts.join(" ") : String(nameParts)).trim();
    if (!newName) {
      console.error("usage: edit <id> <name>");
      process.exit(1);
    }
    const data = await readDB();
    const idx = data.findIndex((u) => u.id === parseInt(id, 10));
    if (idx === -1) {
      console.log("not found");
      return;
    }
    data[idx].Name = newName;
    await writeDB(data);
    console.log(`ok: updated #${id} -> "${newName}"`);
  });

program.parse(process.argv);
