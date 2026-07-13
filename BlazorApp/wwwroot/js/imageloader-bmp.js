// Decodes and downscales an uploaded image using the browser's native (fast, often
// hardware-accelerated) image pipeline, before OpenCV ever sees it. Decoding a full-resolution
// phone photo (10+ MP) directly through OpenCV on this interpreted wasm build can block the
// single UI thread for a very long time - long enough that the whole app looks frozen.
//
// Takes and returns raw byte arrays (Uint8Array), not base64 strings: Blazor marshals a .NET
// byte[] directly to/from a JS Uint8Array without a JSON/string round trip, which is both
// simpler and considerably faster than encoding through base64.
//
// Re-encodes as BMP via encodeBmp() (bmpencoder.js) rather than JPEG/PNG - see that file for why.
var loadAndResizeImageBytes = async function (bytes, maxDimension) {
    const blob = new Blob([bytes]);
    const bitmap = await createImageBitmap(blob);
    try {
        const scale = Math.min(1, maxDimension / Math.min(bitmap.width, bitmap.height));
        const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
        const targetHeight = Math.max(1, Math.round(bitmap.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const context = canvas.getContext("2d");
        context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

        const imageData = context.getImageData(0, 0, targetWidth, targetHeight);
        return encodeBmp(imageData);
    } finally {
        bitmap.close();
    }
}
