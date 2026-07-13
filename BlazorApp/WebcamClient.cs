using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace BlazorApp
{
    public class WebcamClient
    {
        private readonly IJSRuntime jsRuntime;
        private readonly ElementReference videoElement;
        private readonly ElementReference captureCanvasElement;

        public WebcamClient(
            IJSRuntime jsRuntime,
            ElementReference videoElement,
            ElementReference captureCanvasElement)
        {
            this.jsRuntime = jsRuntime;
            this.videoElement = videoElement;
            this.captureCanvasElement = captureCanvasElement;
        }

        public async Task StartAsync()
        {
            await jsRuntime.InvokeVoidAsync("startWebcam", videoElement);
        }

        public async Task StopAsync()
        {
            await jsRuntime.InvokeVoidAsync("stopWebcam", videoElement);
        }

        public async Task<byte[]> CaptureFrameAsync(int? targetWidth = null, int? targetHeight = null)
        {
            return await jsRuntime.InvokeAsync<byte[]>("captureFrame", videoElement, captureCanvasElement, targetWidth, targetHeight);
        }
    }
}
