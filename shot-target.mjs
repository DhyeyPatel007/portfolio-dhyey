import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
const port = 9445;
const out = "/home/hatch/workspace/dhyey-pratham-portfolio/.shots/target";
const chrome = spawn("/home/hatch/workspace/tools/chrome-headless-shell-linux64/chrome-headless-shell", [
  "--no-sandbox", `--remote-debugging-port=${port}`, "--window-size=1440,1000", "about:blank",
], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function pageWs() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const j = await res.json();
      const p = j.find(t => t.type === "page");
      if (p) return p.webSocketDebuggerUrl;
    } catch {}
    await sleep(300);
  }
  throw new Error("no page");
}
const ws = new WebSocket(await pageWs());
await new Promise(r => ws.onopen = r);
let id = 0; const pending = new Map(); const errors = [];
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.text);
};
const send = (method, params = {}) => new Promise(res => { const mid = ++id; pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });
await send("Page.enable"); await send("Runtime.enable");
await send("Page.navigate", { url: "https://prathamfolio.com" });
await sleep(6000);
const info = await send("Runtime.evaluate", { expression: `JSON.stringify({h: document.documentElement.scrollHeight, title: document.title})`, returnByValue: true });
console.log("page:", info.result.value);
async function shot(name) {
  const r = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(out + "/" + name, Buffer.from(r.data, "base64"));
  console.log("saved", name);
}
for (const [y, name] of [[0,"t-hero.png"],[900,"t-intro.png"],[1800,"t-services.png"],[2700,"t-toolkit.png"],[3600,"t-archive.png"],[4700,"t-projects.png"],[5800,"t-video.png"],[6900,"t-contact.png"],[8000,"t-footer.png"]]) {
  await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${y})` });
  await sleep(1100);
  await shot(name);
}
console.log("exceptions:", errors.length ? errors.slice(0,3) : "none");
chrome.kill();
process.exit(0);
