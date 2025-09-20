import http from "http";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";
import { content } from "./main.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;


const CSS = await fs.readFile(path.join(__dirname, "styles.css"), "utf-8");


let usersRaw = await fs.readFile(path.join(__dirname, "users.json"), "utf-8");
let users = JSON.parse(usersRaw);


const send = (res, code, body, headers = {}) => {
  res.writeHead(code, { "Connection": "close", ...headers });
  res.end(body);
};
const sendJSON = (res, code, data) =>
  send(res, code, JSON.stringify(data), { "Content-Type": "application/json" });
const parseJSONBody = async (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const str = Buffer.concat(chunks).toString();
        resolve(str ? JSON.parse(str) : {});
      } catch (e) {
        reject(e);
      }
    });
  });


const userIdFrom = (url) => {
  const m = /^\/users\/(\d+)$/.exec(url);
  return m ? parseInt(m[1], 10) : null;
};


const persist = async () => {
  await fs.writeFile(path.join(__dirname, "users.json"), JSON.stringify(users, null, 2));
  usersRaw = JSON.stringify(users);
};


const server = http.createServer(async (req, res) => {
  try {
    
    if (req.method === "GET") {
      if (req.url === "/") {
        send(res, 200, content("menna"), { "Content-Type": "text/html" });
        return;
      }
      if (req.url === "/styles.css") {
        send(res, 200, CSS, { "Content-Type": "text/css" });
        return;
      }
      if (req.url === "/users") {
        
        sendJSON(res, 200, JSON.parse(usersRaw));
        return;
      }
      const uid = userIdFrom(req.url);
      if (uid !== null) {
        const u = users.find((x) => x.id === uid);
        if (!u) {
          send(res, 404, "NOT FOUND", { "Content-Type": "text/plain" });
          return;
        }
        
        sendJSON(res, 200, u);
        return;
      }
      send(res, 404, "<h1>Error!</h1>", { "Content-Type": "text/html" });
      return;
    }

    if (req.method === "POST" && req.url === "/users") {
      try {
        const body = await parseJSONBody(req);
       
        const newUser = { ...body, id: Date.now() };
        users.push(newUser);
        await persist();
        sendJSON(res, 201, newUser); 
      } catch {
        send(res, 400, "Invalid user data");
      }
      return;
    }

   
    if (req.method === "PUT") {
      const uid = userIdFrom(req.url);
      if (uid !== null) {
        try {
          const body = await parseJSONBody(req);
          const idx = users.findIndex((u) => u.id === uid);
          if (idx === -1) {
            send(res, 404, "User not found");
            return;
          }
          users[idx] = { ...users[idx], ...body, id: uid };
          await persist();
          sendJSON(res, 200, users[idx]); 
        } catch {
          send(res, 400, "Invalid update data");
        }
        return;
      }
    }

    
    if (req.method === "DELETE") {
      const uid = userIdFrom(req.url);
      if (uid !== null) {
        const before = users.length;
        users = users.filter((u) => u.id !== uid);
        if (users.length === before) {
          send(res, 404, "User not found");
          return;
        }
        await persist();
        
        send(res, 200, "User deleted successfully");
        return;
      }
    }

   
    send(res, 405, "Method not allowed");
  } catch (err) {
    console.error("Unhandled error:", err);
    send(res, 500, "Internal Server Error");
  }
});

server.listen(PORT, "localhost", () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
