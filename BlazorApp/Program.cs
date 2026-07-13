using BlazorApp;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using OpenCvSharp;

// OpenCV's own CV_LOG_WARNING calls (e.g. dnn's "Targets are not supported by the new graph
// engine for now", emitted on every FaceDetectorYN.Create) write to stderr in a way that trips
// Blazor's global unhandled-error banner on this wasm build, even though the app keeps running
// fine - see the DNN Face Detection sample. Raising the threshold above WARNING avoids that
// false-positive banner without touching real errors.
Cv2.SetLogLevel(OpenCvSharp.LogLevel.ERROR);

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

await builder.Build().RunAsync();
