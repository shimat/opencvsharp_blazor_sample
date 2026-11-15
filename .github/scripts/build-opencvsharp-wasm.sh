#!/usr/bin/env bash
set -euo pipefail

source_dir=$(realpath "$1")
output_dir=$(realpath -m "$2")
install_dir="$source_dir/opencv_wasm"

emcc --version
emcmake cmake -G Ninja -S "$source_dir/opencv" -B "$source_dir/build-opencv" \
  -DCMAKE_BUILD_TYPE=Release \
  "-DOPENCV_EXTRA_MODULES_PATH=$source_dir/opencv_contrib/modules" \
  "-DCMAKE_INSTALL_PREFIX=$install_dir" \
  -DBUILD_SHARED_LIBS=OFF \
  -DBUILD_TESTS=OFF -DBUILD_PERF_TESTS=OFF -DBUILD_DOCS=OFF -DBUILD_EXAMPLES=OFF \
  -DBUILD_JAVA=OFF -DBUILD_opencv_java_bindings_generator=OFF \
  -DBUILD_opencv_python_bindings_generator=OFF -DBUILD_opencv_python_tests=OFF \
  -DBUILD_opencv_ts=OFF -DBUILD_opencv_js=OFF -DBUILD_opencv_js_bindings_generator=OFF \
  -DBUILD_opencv_apps=OFF -DBUILD_opencv_barcode=OFF -DBUILD_opencv_bioinspired=OFF \
  -DBUILD_opencv_ccalib=OFF -DBUILD_opencv_datasets=OFF -DBUILD_opencv_dnn_objdetect=OFF \
  -DBUILD_opencv_dpm=OFF -DBUILD_opencv_fuzzy=OFF -DBUILD_opencv_gapi=OFF \
  -DBUILD_opencv_intensity_transform=OFF -DBUILD_opencv_mcc=OFF \
  -DBUILD_opencv_objc_bindings_generator=OFF -DBUILD_opencv_rapid=OFF -DBUILD_opencv_reg=OFF \
  -DBUILD_opencv_stereo=ON -DBUILD_opencv_structured_light=OFF \
  -DBUILD_opencv_surface_matching=OFF -DBUILD_opencv_wechat_qrcode=ON -DBUILD_opencv_videostab=OFF \
  -DWITH_GSTREAMER=OFF -DWITH_EIGEN=OFF -DWITH_ADE=OFF \
  -DOPENCV_ENABLE_NONFREE=ON -DWITH_ITT=OFF \
  -DWITH_JPEG=ON -DWITH_TIFF=ON -DWITH_PNG=ON -DWITH_IPP=OFF -DWITH_LAPACK=OFF \
  -DWITH_OPENCL=OFF -DWITH_PTHREADS_PF=OFF -DCV_ENABLE_INTRINSICS=OFF -DBUILD_opencv_dnn=ON
cmake --build "$source_dir/build-opencv" --parallel "$(nproc)"
cmake --install "$source_dir/build-opencv"

em++ -r -o "$install_dir/libopencv.o" -Wl,--whole-archive \
  "$install_dir"/lib/*.a "$install_dir"/lib/opencv5/3rdparty/*.a
emcmake cmake -G Ninja -S "$source_dir/src" -B "$source_dir/build-extern" \
  -DCMAKE_BUILD_TYPE=Release "-DOpenCV_DIR=$install_dir/lib/cmake/opencv5" \
  "-DWASM_LIB=$install_dir/libopencv.o"
cmake --build "$source_dir/build-extern" --parallel "$(nproc)"
mkdir -p "$output_dir"
cp "$source_dir/build-extern/OpenCvSharpExtern/libOpenCvSharpExtern.a" "$output_dir/OpenCvSharpExtern.a"
