import assert from "node:assert/strict";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { chromium } from "playwright";
import { verifyBuildInfo, verifyPhotoPickers, verifySamples } from "./verify-samples.mjs";

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
try {
    browser = await chromium.launch({
        channel: "chrome",
        args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
    });
    console.log("Google Chrome " + browser.version());
    const context = await browser.newContext({ permissions: ["camera"] });
    const home = await context.newPage();
    await home.goto(origin);
    await home.getByRole("heading", { name: "OpenCvSharp + Blazor WebAssembly", exact: true }).waitFor();
    const routes = await home.locator(".sample-card").evaluateAll(cards => cards.map(card => card.getAttribute("href")));
    assert.deepEqual(routes.toSorted(), Object.keys(verifySamples).toSorted(), "Each catalog entry needs a browser test");

    const failures = [];
    for (const [route, verify] of Object.entries({ "build-info": verifyBuildInfo, ...verifySamples })) {
        const page = await context.newPage();
        page.setDefaultTimeout(15_000);
        const browserErrors = [];
        page.on("pageerror", error => browserErrors.push(error.message));
        page.on("console", message => {
            if (message.type() === "error")
                browserErrors.push(message.text());
        });
        try {
            await page.goto(origin + "/" + route);
            await page.locator("h1").waitFor();
            await verify(page);
            await verifyPhotoPickers(page, root, route);
            assert.equal(await page.locator("#blazor-error-ui").isVisible(), false);
            assert.deepEqual(browserErrors, []);
            console.log("PASS " + route);
        } catch (error) {
            failures.push(route);
            console.error("FAIL " + route, error.message);
            for (const message of browserErrors)
                console.error(message);
        } finally {
            await page.close();
        }
    }
    assert.deepEqual(failures, []);
} finally {
    await browser?.close();
    server.close();
}
