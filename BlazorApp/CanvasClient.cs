using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using OpenCvSharp;
using System.Runtime.InteropServices;

namespace BlazorApp
{
    public class CanvasClient
    {
        private readonly IJSRuntime jsRuntime;
        private readonly ElementReference canvasElement;

        public CanvasClient(
            IJSRuntime jsRuntime, 
            ElementReference canvasElement)
        {
            this.jsRuntime = jsRuntime;
            this.canvasElement = canvasElement;
        }
        
        public async Task DrawPixelsAsync(byte[] pixels)
        {
            await jsRuntime.InvokeVoidAsync("drawPixels", canvasElement, pixels);
        }

        public async Task DrawMatAsync(Mat mat)
        {
            Mat? bgra = null;
            try
            {
                var type = mat.Type();
                if (type == MatType.CV_8UC1)
                    bgra = mat.CvtColor(ColorConversionCodes.GRAY2RGBA);
                else if (type == MatType.CV_8UC3)
                    bgra = mat.CvtColor(ColorConversionCodes.BGR2RGBA);
                else
                    throw new ArgumentException($"Invalid mat type ({mat.Type()})");

                var length = (int)(bgra.DataEnd.ToInt64() - bgra.DataStart.ToInt64());
                var pixelBytes = new byte[length];
                Marshal.Copy(bgra.DataStart, pixelBytes, 0, length);

                await DrawPixelsAsync(pixelBytes);
            }
            finally
            {
                bgra?.Dispose();
            }
        }
    }
}
