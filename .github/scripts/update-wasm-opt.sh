#!/usr/bin/env bash
set -euo pipefail
shopt -s nullglob

# The bundled Binaryen lacks flags needed by Release publish (dotnet/runtime#114723).
binaryen_version=version_130
binaryen_sha256=0a18362361ad05465118cd8eeb72edaeec89de6894bc283576ef4e07aa3babcc
wasm_opt_paths=("$DOTNET_ROOT"/packs/Microsoft.NET.Runtime.Emscripten.*.Sdk.linux-x64/*/tools/bin/wasm-opt)
if (( ${#wasm_opt_paths[@]} != 1 )); then
  echo "Expected one wasm-opt in the isolated Linux .NET SDK; found ${#wasm_opt_paths[@]}" >&2
  exit 1
fi

download_dir=$(mktemp -d)
trap 'rm -rf -- "$download_dir"' EXIT
cd "$download_dir"
curl --fail --silent --show-error --location -o binaryen.tar.gz \
  "https://github.com/WebAssembly/binaryen/releases/download/${binaryen_version}/binaryen-${binaryen_version}-x86_64-linux.tar.gz"
echo "$binaryen_sha256  binaryen.tar.gz" | sha256sum -c -
tar -xzf binaryen.tar.gz "binaryen-${binaryen_version}/bin/wasm-opt"
cp "binaryen-${binaryen_version}/bin/wasm-opt" "${wasm_opt_paths[0]}"
"${wasm_opt_paths[0]}" --version
