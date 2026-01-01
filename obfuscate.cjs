const fs = require("fs");
const path = require("path");
const JavaScriptObfuscator = require("javascript-obfuscator");

const targetDir = path.join(process.cwd(), ".next", "static");

function walk(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      walk(full);
      continue;
    }

    if (!full.endsWith(".js")) continue;

    const code = fs.readFileSync(full, "utf8");
    const obfuscated = JavaScriptObfuscator.obfuscate(code, {
      compact: true,
      stringArray: true,
      stringArrayEncoding: ["base64"],
      renameGlobals: false
    }).getObfuscatedCode();

    fs.writeFileSync(full, obfuscated, "utf8");
  }
}

if (fs.existsSync(targetDir)) {
  walk(targetDir);
  console.log("Client bundles obfuscated");
}
