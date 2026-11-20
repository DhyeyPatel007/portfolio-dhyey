import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
const port = 9444;
const out = "/home/hatch/workspace/dhyey-pratham-portfolio/.shots-wide";
const chrome = spawn("/home/hatch/workspace/tools/chrome-headless-shell-linux64/chrome-headless-shell", [
  "--no-sandbox", `--remote-debugging-port=${port}`, "--window-size=1280,590", "about:blank",
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
await send("Page.navigate", { url: "http://localhost:8931/index.html" });
await sleep(3500);
async function shot(name) {
  const r = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(out + "/" + name, Buffer.from(r.data, "base64"));
  console.log("saved", name);
}
async function scrollShot(y, name) {
  await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${y})` });
  await sleep(900);
  await shot(name);
}
await scrollShot(0, "hero.png");
await scrollShot(2750, "archive.png");
await scrollShot(3600, "projects.png");
await scrollShot(4600, "contact.png");
await send("Runtime.evaluate", { expression: `document.querySelector('.nav-link[data-view="projects"]').click()` });
await sleep(1200);
await scrollShot(700, "projects-page.png");
console.log("JS exceptions:", errors.length ? errors : "none");
chrome.kill();
process.exit(0);
