# opencvsharp_blazor_sample

## 🚀 [Live demo](https://shimat.github.io/opencvsharp_blazor_sample/)

Code samples showing [OpenCvSharp](https://github.com/shimat/opencvsharp) running entirely in the browser via Blazor WebAssembly. All image processing happens client-side, on-device, via WebAssembly — no server involved, no image ever leaves the browser.

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/build-info` | `Cv2.GetBuildInformation()` output for the OpenCV build compiled into this app |
| `/samples/pseudo-color` | Applies a false-color palette to a grayscale photo with `Cv2.ApplyColorMap`, switchable between colormaps |
| `/samples/threshold` | Binarizes a photo with `Cv2.Threshold`, either a manual slider cutoff or Otsu's automatic threshold |
| `/samples/canny-edges` | Tunes Canny's two hysteresis thresholds live to see which edges survive |
| `/samples/frequency-filter` | Visualizes a photo's DFT magnitude spectrum and applies a circular low-pass/high-pass mask before `Cv2.Idft` |
| `/samples/features` | AKAZE keypoint detection, plus feature matching between an image and a rotated copy of itself |
| `/samples/template-matching` | Drag out a patch and find every place it matches elsewhere in the photo with `Cv2.MatchTemplate` |
| `/samples/detection` | Real-time face detection against a live webcam feed using a Haar cascade classifier |
| `/samples/aruco` | Generates an ArUco marker and composites it onto a photo at a random position/rotation, then detects it |
| `/samples/color-tracking` | Tunes an HSV range live and tracks the largest matching blob in the webcam feed with `Cv2.InRange` + `FindContours` |
| `/samples/optical-flow` | Tracks corner points frame-to-frame in the webcam feed with `Cv2.CalcOpticalFlowPyrLK` |
| `/samples/interactive` | Drag a rectangle over an image to run `Cv2.GrabCut` and extract the foreground |
| `/samples/watershed-hough` | Live `HoughLinesP`/`HoughCircles` tuning with sliders, plus interactive marker-based `Cv2.Watershed` segmentation |
| `/samples/shape-analysis` | Draw a shape and see its convex hull, rotated bounding box, and polygon approximation at once |
| `/samples/distance-transform` | Paint a blob and visualize how far every pixel is from its nearest edge with `Cv2.DistanceTransform` |
| `/samples/skeleton` | Paint a blob and erode it down to a 1-pixel-wide skeleton with `Cv2.XImgProc.Thinning` |
| `/samples/document-scanner` | Auto-detects a tilted document's corners with `FindContours`/`ApproxPolyDP`, then straightens it with a perspective warp after manual correction |
| `/samples/photo-editing` | Drag-to-place `Cv2.SeamlessClone` blending compared against a naive paste, plus paint-to-remove `Cv2.Inpaint` |
| `/samples/pyramid-blend` | Blends two photos across a seam using Laplacian pyramids instead of a hard cut |
| `/samples/stitching` | Stitches two overlapping photos into one panorama with `Cv2.Stitcher`; stitching is a known-issue preview (see below) |
| `/samples/dnn-detection` | Real-time face detection and landmark localization against a live webcam feed using the YuNet ONNX model via `Cv2.Dnn` |
| `/samples/super-resolution` | Upscales a deliberately low-resolution photo 4x with ESPCN via `Cv2.DnnSuperres`, compared against a naive bicubic resize |
| `/samples/image-classification` | Classifies a photo against ImageNet's 1000 categories using MobileNetV2 via `Cv2.Dnn.ClassificationModel` |
| `/samples/text-detection` | Detects regions of text in a photo using PP-OCRv3's DB detector via `Cv2.Dnn.TextDetectionModelDB` |
| `/samples/object-detection` | Detects COCO's 80 object categories in a photo using YOLOX via a raw `Cv2.Dnn.Net` and a hand-written grid/stride decode |

Most photo-based samples default to a bundled test image, but accept any uploaded photo via a file picker (normalized to a fixed size, with a button to reset back to the default) - the synthetic-image samples (Document Scanner, Watershed & Hough's Hough half, ArUco) don't offer this since they need their specific generated content to demonstrate the algorithm.

## Stack

- .NET 10 / Blazor WebAssembly
- [OpenCvSharp5](https://www.nuget.org/packages/OpenCvSharp5) + [OpenCvSharp5.runtime.wasm](https://www.nuget.org/packages/OpenCvSharp5.runtime.wasm)

## Assets

Bundled test images and DNN models are third-party assets, not original work — see [`BlazorApp/wwwroot/images/README.md`](BlazorApp/wwwroot/images/README.md) and [`BlazorApp/wwwroot/models/README.md`](BlazorApp/wwwroot/models/README.md) for sources and licenses.

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

- AOT-compiling `OpenCvSharp.dll` crashes the Mono AOT compiler ([#8](https://github.com/shimat/opencvsharp_blazor_sample/issues/8)) — worked around by excluding just that assembly from AOT compilation. That exclusion in turn breaks loading any component with an OpenCvSharp-typed field ([#11](https://github.com/shimat/opencvsharp_blazor_sample/issues/11)), so Release publish currently runs with AOT off entirely until one of the two issues is resolved upstream
- The bundled `wasm-opt` predates some binaryen features Release publish needs ([dotnet/runtime#114723](https://github.com/dotnet/runtime/issues/114723)) — worked around by swapping in a newer build during CI publish
- `OpenCvSharp5.runtime.wasm` ships its native lib as `libOpenCvSharpExtern.a`, but the managed side declares `[LibraryImport("OpenCvSharpExtern")]` (no `lib` prefix); the wasm toolchain derives the P/Invoke module name from the file name verbatim, so this mismatch leaves the P/Invoke table empty ([opencvsharp#2039](https://github.com/shimat/opencvsharp/issues/2039)) — worked around by re-referencing a locally renamed copy of the `.a` file before native build
- `cv::ocl::haveOpenCL()` used to throw instead of returning `false` on this wasm build, hanging or hard-aborting any algorithm that internally allocates a `cv::UMat` (e.g. `ORB`, `CascadeClassifier.DetectMultiScale`, `Aruco.ArucoDetector.DetectMarkers`, `Cv2.Stitcher.Stitch`) ([opencvsharp#2037](https://github.com/shimat/opencvsharp/issues/2037)) — fixed upstream in [opencvsharp#2041](https://github.com/shimat/opencvsharp/pull/2041), confirmed resolved as of `OpenCvSharp5`/`OpenCvSharp5.runtime.wasm` `5.0.0.20260712`
- `Cv2.DrawMatches`' P/Invoke signature crashes the Mono interpreter (`OpenCvSharp.dll` runs interpreted on this wasm build, per the AOT-exclusion workaround above) ([opencvsharp#2040](https://github.com/shimat/opencvsharp/issues/2040)) — the `/samples/features` page works around this by drawing match correspondence lines manually instead of calling `Cv2.DrawMatches`
- `Cv2.Aruco.DrawDetectedMarkers` crashes with "memory access out of bounds" inside `cv::FontFace` (likely missing freetype/font support in this build) — the `/samples/aruco` page works around this by drawing each marker's outline and corner manually instead
- This wasm build's OpenCV used to ship without a JPEG/PNG codec, so `Mat.FromImageData` silently returned an empty `Mat` for a byte-for-byte valid JPEG/PNG (no exception) — only BMP decoded, so the "upload your own photo" and webcam-capture paths re-encoded through an uncompressed BMP in JavaScript to work around it. Fixed upstream by enabling `-DWITH_JPEG/PNG/TIFF=ON` in the wasm build ([opencvsharp#2044](https://github.com/shimat/opencvsharp/pull/2044)), confirmed resolved as of `OpenCvSharp5`/`OpenCvSharp5.runtime.wasm` `5.0.0.20260713` — both paths now re-encode directly as PNG/JPEG ([`imageloader.js`](BlazorApp/wwwroot/js/imageloader.js), [`webcam.js`](BlazorApp/wwwroot/js/webcam.js))
- `Cv2.Stitcher.Stitch` aborts this wasm build with a `cv::gemm` assertion failure deep in the bundle adjustment step, followed by an unrecoverable WASM trap ([opencvsharp_blazor_sample#12](https://github.com/shimat/opencvsharp_blazor_sample/issues/12), not yet root-caused as a core OpenCV bug vs. a usage issue) — the `/samples/stitching` page keeps its "Stitch" button disabled and documents this inline
