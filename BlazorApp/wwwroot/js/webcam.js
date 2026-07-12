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

var captureFrame = function (videoElement, canvasElement) {
    const width = videoElement.videoWidth;
    const height = videoElement.videoHeight;
    canvasElement.width = width;
    canvasElement.height = height;

    const context = canvasElement.getContext("2d");
    context.drawImage(videoElement, 0, 0, width, height);

    const dataUrl = canvasElement.toDataURL("image/jpeg", 0.85);
    const base64 = dataUrl.substring(dataUrl.indexOf(",") + 1);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}
