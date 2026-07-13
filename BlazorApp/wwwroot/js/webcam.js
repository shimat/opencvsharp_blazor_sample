var startWebcam = async function (videoElement) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    videoElement.srcObject = stream;
    await videoElement.play();
}

var stopWebcam = function (videoElement) {
    const stream = videoElement.srcObject;
    if (stream) {
        for (const track of stream.getTracks()) {
            track.stop();
        }
    }
    videoElement.srcObject = null;
}

// Returns a JPEG byte array, not raw pixel data: encoding via the canvas's native (often
// hardware-accelerated) JPEG encoder is both faster and produces a much smaller payload than an
// uncompressed bitmap, which matters a lot for a capture called every frame.
// Draws directly at (targetWidth, targetHeight) when given, rather than the camera's native
// resolution (often 720p+) - callers resize down anyway, and capturing straight at the size they
// need cuts both the encode cost and the payload size dramatically, which otherwise dominated
// per-frame latency. Returned as a raw Uint8Array (not base64): Blazor marshals a byte[] return
// value directly to/from a JS Uint8Array without a JSON/base64 round trip, which matters a lot
// for a payload this size called every frame.
var captureFrame = async function (videoElement, canvasElement, targetWidth, targetHeight) {
    // If only one dimension is given, derive the other from the video's native aspect ratio
    // instead of leaving it at native resolution, which would stretch the drawn frame.
    let width = targetWidth;
    let height = targetHeight;
    if (width && !height) {
        height = Math.round(width * videoElement.videoHeight / videoElement.videoWidth);
    } else if (height && !width) {
        width = Math.round(height * videoElement.videoWidth / videoElement.videoHeight);
    } else if (!width && !height) {
        width = videoElement.videoWidth;
        height = videoElement.videoHeight;
    }
    canvasElement.width = width;
    canvasElement.height = height;

    const context = canvasElement.getContext("2d");
    context.drawImage(videoElement, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvasElement.toBlob(resolve, "image/jpeg", 0.85));
    return new Uint8Array(await blob.arrayBuffer());
}
