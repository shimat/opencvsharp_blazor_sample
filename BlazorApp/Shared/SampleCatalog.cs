namespace BlazorApp.Shared
{
    /// <summary>
    /// Metadata for one sample page, shared by <see cref="NavMenu"/> (grouped nav links) and
    /// the landing page (card gallery) so the two don't drift out of sync as samples are added.
    /// </summary>
    /// <param name="Route">Route without a leading slash, e.g. "samples/interactive".</param>
    public record SampleInfo(
        string Route,
        string Title,
        string Category,
        string Icon,
        string Description,
        string[] Tags);

    public static class SampleCatalog
    {
        public static IReadOnlyList<SampleInfo> Samples { get; } = new[]
        {
            new SampleInfo(
                "samples/pseudo-color",
                "Pseudo Color",
                "Basic Processing",
                "sliders",
                "Apply a false-color palette to a grayscale photo and switch between colormaps live.",
                new[] { "Interactive" }),
            new SampleInfo(
                "samples/threshold",
                "Threshold",
                "Basic Processing",
                "sliders",
                "Binarize a photo with a manual threshold slider or Otsu's automatic threshold.",
                new[] { "Interactive" }),
            new SampleInfo(
                "samples/canny-edges",
                "Canny Edge Detection",
                "Basic Processing",
                "sliders",
                "Tune Canny's two hysteresis thresholds and see which edges survive live.",
                new[] { "Interactive" }),
            new SampleInfo(
                "samples/frequency-filter",
                "Frequency Filter",
                "Basic Processing",
                "spectrum",
                "Visualize a photo's DFT magnitude spectrum and apply a circular low-pass/high-pass mask.",
                new[] { "Interactive" }),
            new SampleInfo(
                "samples/features",
                "Keypoints & Matching",
                "Feature Matching",
                "match",
                "AKAZE keypoint detection and feature matching between an image and a rotated copy of itself.",
                new[] { "Static" }),
            new SampleInfo(
                "samples/template-matching",
                "Template Matching",
                "Feature Matching",
                "target-box",
                "Drag out a patch and find every place it matches elsewhere in the photo.",
                new[] { "Interactive" }),
            new SampleInfo(
                "samples/detection",
                "Live Face Detection (Haar Cascade)",
                "Object Detection",
                "viewfinder",
                "Real-time face detection against a live webcam feed using a Haar cascade classifier.",
                new[] { "Realtime", "Webcam" }),
            new SampleInfo(
                "samples/dnn-detection",
                "DNN Face Detection (YuNet)",
                "Object Detection",
                "neural-net",
                "Real-time face detection and landmark localization against a live webcam feed using the YuNet ONNX model via Cv2.Dnn.",
                new[] { "Realtime", "Webcam" }),
            new SampleInfo(
                "samples/aruco",
                "ArUco Marker Detection",
                "Object Detection",
                "marker",
                "Detect a self-generated ArUco marker composited onto a photo at a random position and rotation.",
                new[] { "Interactive" }),
            new SampleInfo(
                "samples/color-tracking",
                "Color Tracking",
                "Motion & Tracking",
                "eyedropper",
                "Tune an HSV range live and track the largest matching blob in the webcam feed.",
                new[] { "Realtime", "Webcam" }),
            new SampleInfo(
                "samples/optical-flow",
                "Optical Flow",
                "Motion & Tracking",
                "motion",
                "Track corner points frame-to-frame with Lucas-Kanade optical flow.",
                new[] { "Realtime", "Webcam" }),
            new SampleInfo(
                "samples/interactive",
                "GrabCut Segmentation",
                "Segmentation & Analysis",
                "cursor",
                "Drag a rectangle around a subject to extract the foreground from an image.",
                new[] { "Interactive" }),
            new SampleInfo(
                "samples/watershed-hough",
                "Watershed & Hough Transform",
                "Segmentation & Analysis",
                "waves",
                "Paint foreground/background markers for watershed segmentation, and tune Hough line/circle detection live with sliders.",
                new[] { "Interactive" }),
            new SampleInfo(
                "samples/shape-analysis",
                "Shape Analysis",
                "Segmentation & Analysis",
                "polygon",
                "Draw a shape and see its convex hull, rotated bounding box, and polygon approximation at once.",
                new[] { "Interactive" }),
            new SampleInfo(
                "samples/distance-transform",
                "Distance Transform",
                "Segmentation & Analysis",
                "heatmap",
                "Paint a blob and visualize how far every pixel is from its nearest edge.",
                new[] { "Interactive" }),
            new SampleInfo(
                "samples/skeleton",
                "Skeleton (Thinning)",
                "Segmentation & Analysis",
                "skeleton-line",
                "Paint a blob and erode it down to a 1-pixel-wide skeleton that preserves its topology.",
                new[] { "Interactive" }),
            new SampleInfo(
                "samples/document-scanner",
                "Document Scanner",
                "Photo Compositing",
                "perspective",
                "Drag the four corners of a tilted document photo, then straighten it with a perspective warp.",
                new[] { "Interactive" }),
            new SampleInfo(
                "samples/photo-editing",
                "Seamless Clone & Inpainting",
                "Photo Compositing",
                "blend",
                "Blend a patch into a photo with Poisson seamless cloning, and remove a painted region with inpainting.",
                new[] { "Interactive" }),
            new SampleInfo(
                "samples/pyramid-blend",
                "Pyramid Blending",
                "Photo Compositing",
                "pyramid",
                "Blend two photos across a seam using Laplacian pyramids instead of a hard cut.",
                new[] { "Interactive" }),
            new SampleInfo(
                "samples/stitching",
                "Panorama Stitching",
                "Photo Compositing",
                "panorama",
                "Stitch two overlapping photos into one panorama.",
                new[] { "Interactive" }),
        };

        public static IEnumerable<IGrouping<string, SampleInfo>> ByCategory =>
            Samples.GroupBy(s => s.Category);
    }
}
