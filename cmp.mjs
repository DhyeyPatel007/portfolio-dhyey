import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
const port = 9445;
const out = "/home/hatch/workspace/dhyey-pratham-portfolio/.cmp";
mkdirSync(out, { recursive: true });
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
const ev = async expr => (await send("Runtime.evaluate", { expression: expr, returnByValue: true })).result?.value;
await send("Page.enable"); await send("Runtime.enable");

async function captureSite(prefix, url) {
  await send("Page.navigate", { url });
  await sleep(5000);
  const height = await ev("document.body.scrollHeight");
  console.log(prefix, "page height:", height);
  let y = 0, n = 0;
  while (y < height && n < 14) {
    await ev(`window.scrollTo(0, ${y})`);
    await sleep(1100);
    const r = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(`${out}/${prefix}-${String(n).padStart(2, "0")}.png`, Buffer.from(r.data, "base64"));
    console.log("saved", prefix, n, "y=", y);
    y += 850; n++;
  }
  return height;
}
await captureSite("target", "https://prathamfolio.com/");
// try clicking Projects / About nav on target
const clickedP = await ev(`(() => { const a = [...document.querySelectorAll('a,button')].find(e => /projects/i.test(e.textContent) && e.textContent.length < 30); if (a) { a.click(); return a.textContent.trim(); } return null; })()`);
console.log("clicked projects:", clickedP);
await sleep(2500);
await ev("window.scrollTo(0,0)"); await sleep(800);
let r = await send("Page.captureScreenshot", { format: "png" });
writeFileSync(`${out}/target-projects.png`, Buffer.from(r.data, "base64"));
const clickedA = await ev(`(() => { const a = [...document.querySelectorAll('a,button')].find(e => /about/i.test(e.textContent) && e.textContent.length < 30); if (a) { a.click(); return a.textContent.trim(); } return null; })()`);
console.log("clicked about:", clickedA);
await sleep(2500);
await ev("window.scrollTo(0,0)"); await sleep(800);
r = await send("Page.captureScreenshot", { format: "png" });
writeFileSync(`${out}/target-about.png`, Buffer.from(r.data, "base64"));
console.log("exceptions:", errors.length ? errors.slice(0,3) : "none");
chrome.kill();
process.exit(0);
