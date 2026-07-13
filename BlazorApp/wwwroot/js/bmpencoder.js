// Shared BMP encoder. This wasm build's OpenCV has no JPEG or PNG codec - Mat.FromImageData
// silently returns an empty Mat (no exception) for otherwise well-formed JPEG/PNG bytes - so any
// image handed to OpenCV in this app (webcam frames, uploaded photos) is encoded as an
// uncompressed 24-bit BMP instead, the one format confirmed to decode (see Mandrill.bmp).

// Encodes raw RGBA pixel data (from a canvas ImageData) as an uncompressed 24-bpp BMP
// (BITMAPINFOHEADER).
function encodeBmp(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const rowSize = Math.floor((width * 3 + 3) / 4) * 4;
    const pixelArraySize = rowSize * height;
    const fileSize = 54 + pixelArraySize;

    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);

    // File header (14 bytes).
    view.setUint8(0, 0x42); // 'B'
    view.setUint8(1, 0x4D); // 'M'
    view.setUint32(2, fileSize, true);
    view.setUint32(6, 0, true);
    view.setUint32(10, 54, true);

    // DIB header - BITMAPINFOHEADER (40 bytes).
    view.setUint32(14, 40, true);
    view.setInt32(18, width, true);
    view.setInt32(22, height, true); // positive height => bottom-up row order
    view.setUint16(26, 1, true);
    view.setUint16(28, 24, true);
    view.setUint32(30, 0, true); // BI_RGB, no compression
    view.setUint32(34, pixelArraySize, true);
    view.setInt32(38, 0, true);
    view.setInt32(42, 0, true);
    view.setUint32(46, 0, true);
    view.setUint32(50, 0, true);

    const src = imageData.data;
    const pixels = new Uint8Array(buffer, 54);
    let offset = 0;
    for (let y = height - 1; y >= 0; y--) {
        for (let x = 0; x < width; x++) {
            const srcIndex = (y * width + x) * 4;
            pixels[offset++] = src[srcIndex + 2]; // B
            pixels[offset++] = src[srcIndex + 1]; // G
            pixels[offset++] = src[srcIndex];     // R
        }
        offset += rowSize - width * 3;
    }

    return new Uint8Array(buffer);
}
