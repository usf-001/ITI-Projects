
const fs = require('fs/promises');
const path = require('path');

const DB_PATH = path.join(__dirname, 'users.json');


const readDb = async () => {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
};
const writeDb = (arr) => fs.writeFile(DB_PATH, JSON.stringify(arr, null, 2) + '\n', 'utf8');

function printTable(rows) {
  if (!rows.length) {
    console.log('∅ no users yet');
    return;
  }
  
  const cols = ['id', 'Name'];
  const widths = cols.map((c) => Math.max(c.length, ...rows.map((r) => String(r[c]).length)));
  const line = (vals) =>
    vals
      .map((v, i) => String(v).padEnd(widths[i]))
      .join('  ');
  console.log(line(cols));
  console.log(widths.map((w) => '─'.repeat(w)).join('  '));
  rows.forEach((r) => console.log(line([r.id, r.Name])));
}

function reqId(id) {
  const n = Number(id);
  if (!id || Number.isNaN(n)) {
    console.error('usage: getone|edit|remove <id>');
    process.exit(1);
  }
  return n;
}

(async () => {
  const [, , actionRaw, ...rest] = process.argv;
  const action = (actionRaw || '').toLowerCase();

  try {
    switch (action) {
      case 'getall': {
        const users = await readDb();
        
        printTable(users);
        break;
      }

      case 'getone': {
        const id = reqId(rest[0]);
        const users = await readDb();
        const user = users.find((u) => u.id === id);
       
        if (user) {
          console.log(JSON.stringify(user));
        } else {
          console.log('not found');
        }
        break;
      }

      case 'add': {
        
        const name = rest.join(' ').trim();
        if (!name) {
          console.error('usage: add <name>');
          process.exit(1);
        }
        const users = await readDb();

        
        const nextId =
          users.length === 0 ? 1 : users.reduce((m, u) => (u.id > m ? u.id : m), users[0].id) + 1;

        
        const newUser = { id: nextId, Name: name };
        users.push(newUser);
        await writeDb(users);

        
        console.log(`ok: added #${newUser.id} "${newUser.Name}"`);
        break;
      }

      case 'remove': {
        const id = reqId(rest[0]);
        const users = await readDb();
        const before = users.length;
        const after = users.filter((u) => u.id !== id);
        if (after.length === before) {
          console.log('nothing removed (id not found)');
        } else {
          await writeDb(after);
          console.log(`ok: removed #${id}`);
        }
        break;
      }

      case 'edit': {
        
        const id = reqId(rest.shift());
        const name = (rest || []).join(' ').trim();
        if (!name) {
          console.error('usage: edit <id> <name>');
          process.exit(1);
        }
        const users = await readDb();
        const idx = users.findIndex((u) => u.id === id);
        if (idx === -1) {
          console.log('not found');
        } else {
          users[idx].Name = name; 
          await writeDb(users);
          console.log(`ok: updated #${id} -> "${name}"`);
        }
        break;
      }

      case 'help':
      case '--help':
      case '-h':
      default: {
        console.log(
          [
            'Users CLI',
            '',
            '  getall',
            '  getone <id>',
            '  add <name>',
            '  edit <id> <name>',
            '  remove <id>',
          ].join('\n')
        );
      }
    }
  } catch (err) {
    console.error('error:', err.message);
    process.exitCode = 1;
  }
})();
