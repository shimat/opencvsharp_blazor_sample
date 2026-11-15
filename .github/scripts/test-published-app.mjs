import assert from "node:assert/strict";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { chromium } from "playwright";

const root = resolve(process.argv[2]);
const mimeTypes = {
    ".css": "text/css",
    ".html": "text/html",
    ".js": "text/javascript",
    ".json": "application/json",
    ".wasm": "application/wasm",
};
const server = createServer(async (request, response) => {
    const { pathname } = new URL(request.url, "http://localhost");
    const path = resolve(root, extname(pathname) ? "." + pathname : "index.html");
    if (pathname === "/favicon.ico") {
        response.writeHead(204).end();
        return;
    }
    if (!path.startsWith(root + sep)) {
        response.writeHead(403).end();
        return;
    }
    try {
        const content = await readFile(path);
        response.writeHead(200, { "Content-Type": mimeTypes[extname(path)] ?? "application/octet-stream" });
        response.end(content);
    } catch (error) {
        response.writeHead(error.code === "ENOENT" ? 404 : 500).end();
    }
});

server.listen(0, "127.0.0.1");
await once(server, "listening");
const origin = "http://127.0.0.1:" + server.address().port;
let browser;
const browserErrors = [];
try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    page.on("pageerror", error => browserErrors.push(error.message));
    page.on("console", message => {
        if (message.type() === "error")
            browserErrors.push(message.text());
    });

    await page.goto(origin + "/samples/features");
    await page.getByRole("heading", { name: "Feature Matching", exact: true }).waitFor();
    await waitForCanvases(page);
    const blank = await page.locator("canvas").nth(1).evaluate(canvas => canvas.toDataURL());
    await page.getByRole("button", { name: "Detect AKAZE keypoints" }).click();
    await page.waitForFunction(previous => document.querySelectorAll("canvas")[1].toDataURL() !== previous, blank);
    console.log("Feature Matching loaded directly and rendered the AKAZE result.");

    await page.goto(origin + "/samples/canny-edges");
    await page.getByRole("heading", { name: "Canny Edge Detection", exact: true }).waitFor();
    await waitForCanvases(page);
    console.log("Canny Edge Detection loaded directly and rendered its source and result.");
    assert.deepEqual(browserErrors, []);
} catch (error) {
    for (const message of browserErrors)
        console.error(message);
    throw error;
} finally {
    await browser?.close();
    server.close();
}

async function waitForCanvases(page) {
    await page.waitForFunction(() =>
        Array.from(document.querySelectorAll("canvas")).slice(0, 2).filter(canvas =>
            canvas.getContext("2d").getImageData(20, 20, 1, 1).data[3] > 0).length === 2);
}
