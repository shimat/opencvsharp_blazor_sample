import { join } from "node:path";

export const verifySamples = {
    "samples/pseudo-color": async (page, root) => {
        await changeCanvas(page, 1, () => page.locator("select").selectOption({ label: "Hot" }));
        const photo = page.locator('input[type="file"]');
        await changeCanvas(page, 0, () => photo.setInputFiles(join(root, "images", "WhiteCat.jpg")));
        await changeCanvas(page, 0, () => click(page, "Reset to default"));
    },
    "samples/threshold": async page => {
        const auto = page.getByRole("checkbox", { name: "Auto (Otsu)" });
        await auto.uncheck();
        await changeCanvas(page, 1, () => slider(page, 0, 64));
        await changeCanvas(page, 1, () => auto.check());
    },
    "samples/canny-edges": page => changeCanvas(page, 1, () => slider(page, 1, 224)),
    "samples/frequency-filter": async page => {
        await pixels(page, [0, 1, 2]);
        await changeCanvas(page, 2, () => page.getByRole("radio", { name: /High-pass/ }).check());
        await changeCanvas(page, 2, () => slider(page, 0, 24));
    },
    "samples/features": async page => {
        await page.getByRole("heading", { name: "Feature Matching", exact: true }).waitFor();
        await pixels(page, [0]);
        await changeCanvas(page, 1, () => click(page, "Detect AKAZE keypoints"));
        await changeCanvas(page, 2, () => click(page, "Match features"));
    },
    "samples/template-matching": async page => {
        await changeCanvas(page, 0, () => drag(page, 0, [48, 52], [90, 96]));
        await page.getByText(/other match/).waitFor();
    },
    "samples/detection": verifyCamera,
    "samples/aruco": async page => {
        await pixels(page, [0]);
        await click(page, "Detect");
        await page.getByText(/Detected marker ID \d+/).waitFor();
        await pixels(page, [1]);
    },
    "samples/color-tracking": verifyCamera,
    "samples/optical-flow": verifyCamera,
    "samples/interactive": async page => {
        await pixels(page, [0]);
        await changeCanvas(page, 1, () => drag(page, 0, [48, 48], [200, 200]));
        await page.getByText(/Done - drag again/).waitFor();
    },
    "samples/watershed-hough": async page => {
        await changeCanvas(page, 0, () => slider(page, 2, 120));
        await pixels(page, [1]);
        await drag(page, 1, [108, 115], [148, 138]);
        await click(page, "Mark background");
        await drag(page, 1, [15, 25], [39, 190]);
        await changeCanvas(page, 2, () => click(page, "Segment"));
    },
    "samples/shape-analysis": page => paintAndAnalyze(page, "Analyze", /Analyzed - the approximated polygon/),
    "samples/distance-transform": page => paintAndAnalyze(page, "Distance transform", /Brighter pixels/),
    "samples/skeleton": page => paintAndAnalyze(page, "Skeletonize", /Skeleton extracted/),
    "samples/document-scanner": async page => {
        await pixels(page, [0, 1]);
        const handle = page.locator("svg circle").first();
        const x = Number(await handle.getAttribute("cx"));
        const y = Number(await handle.getAttribute("cy"));
        await changeCanvas(page, 1, () => drag(page, 0, [x, y], [x + 18, y + 16]));
    },
    "samples/photo-editing": async page => {
        await pixels(page, [0, 1, 2, 3]);
        await changeCanvas(page, 1, () => drag(page, 0, [96, 83], [164, 144]));
        await drag(page, 2, [95, 113], [141, 129]);
        await changeCanvas(page, 3, () => click(page, "Remove painted area"));
    },
    "samples/pyramid-blend": page => changeCanvas(page, 1, () => slider(page, 0, 78)),
    "samples/stitching": async (page, root) => {
        await pixels(page, [0, 1, 2]);
        const photos = page.locator('input[type="file"]');
        const reset = page.getByRole("button", { name: "Reset to default", exact: true });
        for (const index of [0, 1]) {
            await changeCanvas(page, index, () => photos.nth(index).setInputFiles(join(root, "images", "WhiteCat.jpg")));
            await changeCanvas(page, index, () => reset.nth(index).click());
        }
        await changeCanvas(page, 2, () => click(page, "Stitch"));
        await page.getByText("Stitched successfully.").waitFor();
    },
    "samples/dnn-detection": verifyCamera,
    "samples/super-resolution": page => pixels(page, [0, 1, 2]),
    "samples/image-classification": async page => {
        await page.locator("em").filter({ hasText: /\d+\s*% confidence/ }).waitFor();
        await changeCanvas(page, 0, () => page.locator("select").selectOption("1"));
    },
    "samples/text-detection": async page => {
        await pixels(page, [0]);
        await page.locator("em").filter({ hasText: /Found [1-9]\d* text region/ }).waitFor();
    },
    "samples/object-detection": async page => {
        await pixels(page, [0]);
        await page.locator("em").filter({ hasText: /Found [1-9]\d* object/ }).waitFor();
    },
};

export function verifyBuildInfo(page) {
    return page.locator("pre").filter({ hasText: "General configuration for OpenCV" }).waitFor();
}

async function verifyCamera(page) {
    await click(page, "Start");
    await changeCanvas(page, 0);
    await click(page, "Stop");
    await page.waitForFunction(() => document.querySelector("video").srcObject === null);
}

async function paintAndAnalyze(page, button, status) {
    await pixels(page, [0]);
    await drag(page, 0, [82, 98], [146, 140]);
    await changeCanvas(page, 1, () => click(page, button));
    await page.getByText(status).waitFor();
}

function click(page, name) {
    return page.getByRole("button", { name, exact: true }).click();
}

function slider(page, index, value) {
    return page.getByRole("slider").nth(index).fill(String(value));
}

async function drag(page, index, from, to) {
    const canvas = page.locator("canvas:visible").nth(index);
    await canvas.scrollIntoViewIfNeeded();
    const box = await canvas.boundingBox();
    await page.mouse.move(box.x + from[0], box.y + from[1]);
    await page.mouse.down();
    await page.mouse.move(box.x + to[0], box.y + to[1], { steps: 6 });
    await page.mouse.up();
}

function pixels(page, indexes) {
    return page.waitForFunction(indexes => {
        const canvases = [...document.querySelectorAll("canvas")].filter(canvas => canvas.getClientRects().length);
        return indexes.every(index => canvases[index]?.getContext("2d").getImageData(20, 20, 1, 1).data[3] > 0);
    }, indexes);
}

async function changeCanvas(page, index, act) {
    await pixels(page, [index]);
    const before = await page.locator("canvas:visible").nth(index).evaluate(canvas => canvas.toDataURL());
    await act?.();
    await page.waitForFunction(({ index, before }) => {
        const canvases = [...document.querySelectorAll("canvas")].filter(canvas => canvas.getClientRects().length);
        return canvases[index]?.toDataURL() !== before;
    }, { index, before });
}
