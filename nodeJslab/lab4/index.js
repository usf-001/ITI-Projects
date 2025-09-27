const fs = require("fs");
console.log("first"); // 1
fs.readFile(__filename, () => {
  console.log("first fs");
}); // 9

setTimeout(() => {
  console.log("first TimeOut"); //4
  process.nextTick(() => console.log("second nextTick")); //5
  Promise.resolve().then(() => console.log("second promise")); //6
  setImmediate(() => console.log("second immediate")); // 8
}, 10);
setTimeout(() => console.log("second timeout")); //7
process.nextTick(() => console.log("first nextTick")); // 2
Promise.resolve().then(() => console.log("first promise")); // 3
setImmediate(() => console.log("first immediate")); //10
