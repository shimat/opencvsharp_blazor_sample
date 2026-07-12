# opencvsharp_blazor_sample

## 🚀 [Live demo](https://shimat.github.io/opencvsharp_blazor_sample/opencvsharp_sample)

Code samples showing [OpenCvSharp](https://github.com/shimat/opencvsharp) running entirely in the browser via Blazor WebAssembly. All image processing happens client-side, on-device, via WebAssembly — no server involved, no image ever leaves the browser.

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/build-info` | `Cv2.GetBuildInformation()` output for the OpenCV build compiled into this app |
| `/opencvsharp_sample` | Loads a test image and runs a few basic `Cv2` operations on it (pseudo-color, threshold, Canny edge detection), drawing the results to an HTML5 `<canvas>` |
| `/samples/features` | AKAZE keypoint detection, plus feature matching between an image and a rotated copy of itself |
| `/samples/detection` | Real-time face detection against a live webcam feed using a Haar cascade classifier (see known issue below) |
| `/samples/interactive` | Drag a rectangle over an image to run `Cv2.GrabCut` and extract the foreground |

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
- `OpenCvSharp5.runtime.wasm` ships its native lib as `libOpenCvSharpExtern.a`, but the managed side declares `[LibraryImport("OpenCvSharpExtern")]` (no `lib` prefix); the wasm toolchain derives the P/Invoke module name from the file name verbatim, so this mismatch leaves the P/Invoke table empty ([opencvsharp#2039](https://github.com/shimat/opencvsharp/issues/2039)) — worked around by re-referencing a locally renamed copy of the `.a` file before native build
- Any algorithm that internally allocates a `cv::UMat` (e.g. `ORB`, `CascadeClassifier.DetectMultiScale`) hangs or hard-aborts, because `cv::ocl::haveOpenCL()` throws instead of returning `false` on this wasm build ([opencvsharp#2037](https://github.com/shimat/opencvsharp/issues/2037)) — the root cause is a missing `-DWITH_OPENCL=OFF` in OpenCvSharp's wasm build CMake configuration, so it can't be worked around from this app. The `/samples/features` page avoids this by using AKAZE instead of ORB; the `/samples/detection` page (which needs `CascadeClassifier`) is kept as a preview with an on-page notice, pending an upstream fix
- `Cv2.DrawMatches`' P/Invoke signature crashes the Mono interpreter (`OpenCvSharp.dll` runs interpreted on this wasm build, per the AOT-exclusion workaround above) ([opencvsharp#2040](https://github.com/shimat/opencvsharp/issues/2040)) — the `/samples/features` page works around this by drawing match correspondence lines manually instead of calling `Cv2.DrawMatches`
