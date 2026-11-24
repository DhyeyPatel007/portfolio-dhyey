// Local verification for the 3D workshop: boots the preview server page in the
// local headless-shell, screenshots the boot overlay, presses W (boot sequence),
// clicks the AuraPPH dock button (glide + station card), and logs console errors.
// Usage: npm run preview (port 4173) in one shell, then: node shot-workshop.mjs
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";

const port = 9562;
const out = ".shots-workshop";
mkdirSync(out, { recursive: true });

const chrome = spawn(
  "/home/hatch/workspace/tools/chrome-headless-shell-linux64/chrome-headless-shell",
  [
    "--no-sandbox",
    `--remote-debugging-port=${port}`,
    "--window-size=1440,900",
    "--hide-scrollbars",
    "--use-angle=swiftshader",
    "about:blank",
  ],
  { stdio: "ignore" }
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pageWs() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const j = await res.json();
      const p = j.find((t) => t.type === "page");
      if (p) return p.webSocketDebuggerUrl;
    } catch {}
    await sleep(300);
  }
  throw new Error("no page");
}

const ws = new WebSocket(await pageWs());
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
const consoleMsgs = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m.result);
    pending.delete(m.id);
  }
  if (m.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(m.params.type)) {
    consoleMsgs.push(`${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description ?? "").join(" ")}`);
  }
  if (m.method === "Runtime.exceptionThrown") {
    consoleMsgs.push(`EXCEPTION: ${m.params.exceptionDetails?.text ?? ""} ${m.params.exceptionDetails?.exception?.description ?? ""}`);
  }
};
const send = (method, params = {}) =>
  new Promise((res) => {
    const mid = ++id;
    pending.set(mid, res);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
const evalJs = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
  return r?.result?.value;
};
const shot = async (name) => {
  const r = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${out}/${name}.png`, Buffer.from(r.data, "base64"));
  console.log("shot:", name);
};

await send("Runtime.enable");
await send("Page.enable");
await send("Page.navigate", { url: "http://localhost:4173/#/workshop" });
await sleep(5000);

console.log("webgl2:", await evalJs(`(()=>{const c=document.createElement('canvas');return !!c.getContext('webgl2')})()`));
console.log("boot overlay visible:", await evalJs(`!!document.body.innerText.includes('The room is dark')`));
await shot("01-boot-overlay");

// press W to wake the room
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "w", code: "KeyW", windowsVirtualKeyCode: 87 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "w", code: "KeyW", windowsVirtualKeyCode: 87 });
await sleep(3500);
console.log("boot overlay gone:", await evalJs(`!document.body.innerText.includes('The room is dark')`));
await shot("02-after-boot");

// click the AuraPPH dock button
await evalJs(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('AuraPPH'))?.click()`);
await sleep(1800);
console.log("station card open:", await evalJs(`document.body.innerText.includes('Offline phone-camera blood-loss meter')`));
await shot("03-aurapph-card");

// back to 2D via the top strip
await evalJs(`[...document.querySelectorAll('button')].find(b => b.textContent.trim() === '2D Mode')?.click()`);
await sleep(1500);
console.log("back on home:", await evalJs(`document.body.innerText.includes('Step inside my workshop')`));
await shot("04-home-entry");

console.log("console errors/warnings:", consoleMsgs.length ? consoleMsgs : "none");
chrome.kill();
process.exit(0);
