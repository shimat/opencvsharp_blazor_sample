# opencvsharp_blazor_sample

### 🚀 [Live demo](https://shimat.github.io/opencvsharp_blazor_sample/opencvsharp_sample)

Code samples showing [OpenCvSharp](https://github.com/shimat/opencvsharp) running entirely in the browser via Blazor WebAssembly. All image processing happens client-side, on-device, via WebAssembly — no server involved, no image ever leaves the browser.

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/opencvsharp_sample` | Loads a test image and runs a few `Cv2` operations on it (grayscale, pseudo-color, threshold, Canny edge detection, AKAZE keypoint detection), drawing the results to an HTML5 `<canvas>` |
| `/build-info` | `Cv2.GetBuildInformation()` output for the OpenCV build compiled into this app |

## Stack

- .NET 10 / Blazor WebAssembly
- [OpenCvSharp5](https://www.nuget.org/packages/OpenCvSharp5) + [OpenCvSharp5.runtime.wasm](https://www.nuget.org/packages/OpenCvSharp5.runtime.wasm)

## Running locally

Requires the .NET 10 SDK and the `wasm-tools` workload:

```sh
dotnet workload install wasm-tools
dotnet run --project BlazorApp
```

Then open the URL printed in the console (typically `http://localhost:5089`).

## Deployment

Pushing to `main` publishes and deploys the app to GitHub Pages via [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

## Known issues / workarounds

The current wasm-tools toolchain has a couple of rough edges around statically linking a large native library (like OpenCV) into a Blazor WebAssembly app. `BlazorApp.csproj` and the deploy workflow carry documented workarounds for:

- AOT-compiling `OpenCvSharp.dll` crashes the Mono AOT compiler ([#8](https://github.com/shimat/opencvsharp_blazor_sample/issues/8)) — worked around by excluding just that assembly from AOT compilation
- The bundled `wasm-opt` predates some binaryen features Release publish needs ([dotnet/runtime#114723](https://github.com/dotnet/runtime/issues/114723)) — worked around by swapping in a newer build during CI publish
