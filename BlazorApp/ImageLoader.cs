using Microsoft.AspNetCore.Components.Forms;
using Microsoft.JSInterop;
using OpenCvSharp;

namespace BlazorApp
{
    /// <summary>
    /// Decodes a user-uploaded image file and normalizes it to a fixed square size, so every
    /// sample that accepts an uploaded photo can keep its existing size-dependent pixel math
    /// (patch sizes, drag thresholds, marker radii) unchanged - only Mandrill.bmp's own 256x256
    /// size ever flowed through those pages before.
    /// </summary>
    public static class ImageLoader
    {
        private const long DefaultMaxFileSize = 20 * 1024 * 1024;

        public static async Task<Mat> LoadFromFileAsync(IJSRuntime jsRuntime, IBrowserFile file, int targetSize, long maxAllowedSize = DefaultMaxFileSize)
        {
            await using var stream = file.OpenReadStream(maxAllowedSize);
            using var memoryStream = new MemoryStream();
            await stream.CopyToAsync(memoryStream);

            return await LoadFromBytesAsync(jsRuntime, memoryStream.ToArray(), targetSize);
        }

        // Same decode/resize path as LoadFromFileAsync, for callers that already have the raw
        // bytes in memory (e.g. a bundled default image fetched via HttpClient) rather than an
        // IBrowserFile.
        public static async Task<Mat> LoadFromBytesAsync(IJSRuntime jsRuntime, byte[] bytes, int targetSize)
        {
            // Let the browser's own (fast, native) image pipeline decode and downscale the photo
            // first - handing OpenCV a full-resolution photo directly would decode it on this
            // interpreted wasm build's single UI thread, which can look like the whole app has
            // frozen for a large image.
            var resizedBytes = await jsRuntime.InvokeAsync<byte[]>("loadAndResizeImageBytes", bytes, targetSize);

            using var decoded = Mat.FromImageData(resizedBytes);
            if (decoded.Empty())
                throw new InvalidOperationException("The browser couldn't decode that image.");

            return ResizeToFillSquare(decoded, targetSize);
        }

        // Scales so the shorter side matches targetSize, then center-crops to targetSize x targetSize.
        private static Mat ResizeToFillSquare(Mat src, int targetSize)
        {
            var scale = targetSize / (double)Math.Min(src.Width, src.Height);
            var scaledSize = new Size(
                Math.Max(targetSize, (int)Math.Round(src.Width * scale)),
                Math.Max(targetSize, (int)Math.Round(src.Height * scale)));

            using var scaled = new Mat();
            Cv2.Resize(src, scaled, scaledSize);

            var x = (scaled.Width - targetSize) / 2;
            var y = (scaled.Height - targetSize) / 2;
            using var cropped = new Mat(scaled, new Rect(x, y, targetSize, targetSize));
            return cropped.Clone();
        }
    }
}
