
const fs = require('fs/promises');
const path = require('path');

const USERS_FILE = path.join(__dirname, 'users.json');

async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err.code === 'ENOENT') return []; 
    throw err;
  }
}

async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2) + '\n', 'utf8');
}

function toNumbers(args) {
  const nums = args.map((x) => Number(x));
  if (nums.some((n) => Number.isNaN(n))) {
    throw new Error('All operands must be valid numbers.');
  }
  return nums;
}

function nextId(users) {
  if (!users.length) return 1;
  const maxId = users.reduce((m, u) => (u.id > m ? u.id : m), 0);
  return maxId + 1;
}


(async () => {
  const [, , actionRaw, ...rest] = process.argv;
  const action = (actionRaw || '').toLowerCase();

  try {
    switch (action) {
     
      case 'sum': {
        const nums = toNumbers(rest);
        if (nums.length === 0) throw new Error('Provide at least one number.');
        const result = nums.reduce((a, b) => a + b, 0);
        console.log(result);
        break;
      }
      case 'sub': {
       
        const nums = toNumbers(rest);
        if (nums.length === 0) throw new Error('Provide at least one number.');
        const result = nums.slice(1).reduce((a, b) => a - b, nums[0]);
        console.log(result);
        break;
      }
      case 'multi':
      case 'multiply': {
       
        const nums = toNumbers(rest);
        if (nums.length === 0) throw new Error('Provide at least one number.');
        const result = nums.reduce((a, b) => a * b, 1);
        console.log(result);
        break;
      }

     
      case 'add': {
        
        const name = rest.join(' ').trim();
        if (!name) throw new Error('Usage: add <name>');
        const users = await readUsers();
        const id = nextId(users); 
        users.push({ id, name });
        await writeUsers(users);
        console.log(`Added user #${id}: ${name}`);
        break;
      }

      case 'remove': {
        
        const id = Number(rest[0]);
        if (!rest[0] || Number.isNaN(id)) throw new Error('Usage: remove <id>');
        const users = await readUsers();
        const before = users.length;
        const filtered = users.filter((u) => u.id !== id);
        if (filtered.length === before) {
          console.error(`No user found with id ${id}.`);
        } else {
          await writeUsers(filtered);
          console.log(`Removed user #${id}.`);
        }
        break;
      }

      case 'getall': {
        const users = await readUsers();
        if (!users.length) {
          console.log('No users found.');
        } else {
          console.log(users);
        }
        break;
      }

      case 'getone': {
        
        const id = Number(rest[0]);
        if (!rest[0] || Number.isNaN(id)) throw new Error('Usage: getone <id>');
        const users = await readUsers();
        const user = users.find((u) => u.id === id);
        if (!user) {
          console.error(`No user found with id ${id}.`);
        } else {
          console.log(user);
        }
        break;
      }

      case 'edit': {
       
        const id = Number(rest.shift());
        const name = (rest || []).join(' ').trim();
        if (!id || Number.isNaN(id) || !name) {
          throw new Error('Usage: edit <id> <name>');
        }
        const users = await readUsers();
        const idx = users.findIndex((u) => u.id === id);
        if (idx === -1) {
          console.error(`No user found with id ${id}.`);
        } else {
          users[idx].name = name;
          await writeUsers(users);
          console.log(`Updated user #${id} -> ${name}`);
        }
        break;
      }

      case 'help':
      case '--help':
      case '-h':
      default: {
        console.log(`
Usage:
  Math:
    node . sum <n...>
    node . sub <n...>
    node . multi <n...>

  Users:
    node . add <name>
    node . getall
    node . getone <id>
    node . edit <id> <name>
    node . remove <id>
`);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exitCode = 1;
  }
})();
