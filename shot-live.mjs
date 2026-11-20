import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
const port = 9561;
const chrome = spawn("/home/hatch/workspace/tools/chrome-headless-shell-linux64/chrome-headless-shell", [
  "--no-sandbox", `--remote-debugging-port=${port}`, "--window-size=1440,1000", "--hide-scrollbars", "about:blank",
], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function pageWs() {
  for (let i = 0; i < 40; i++) {
    try { const res = await fetch(`http://127.0.0.1:${port}/json/list`); const j = await res.json();
      const p = j.find(t => t.type === "page"); if (p) return p.webSocketDebuggerUrl; } catch {}
    await sleep(300);
  } throw new Error("no page");
}
const ws = new WebSocket(await pageWs());
await new Promise(r => ws.onopen = r);
let id = 0; const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise(res => { const mid = ++id; pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });
await send("Page.enable");
await send("Page.navigate", { url: "https://portfolio-dhyey-eta.vercel.app/" });
await sleep(7000);
const r = await send("Page.captureScreenshot", { format: "png" });
mkdirSync(".shots-live", { recursive: true });
writeFileSync(".shots-live/live-hero.png", Buffer.from(r.data, "base64"));
console.log("ok");
chrome.kill(); process.exit(0);
