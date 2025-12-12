#!/bin/bash

# Ensure public directory exists
mkdir -p public

echo "Compiling C++ to WASM..."

emcc wasm/filters.cpp \
  -o public/filters.js \
  -O3 \
  -s WASM=1 \
  -s "EXPORTED_FUNCTIONS=['_grayscale', '_invert', '_sharpen', '_blur', '_edgeDetect', '_malloc', '_free']" \
  -s "EXPORTED_RUNTIME_METHODS=['ccall', 'cwrap', 'HEAPU8']" \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s ENVIRONMENT=web \
  -s SINGLE_FILE=0 \
  --post-js wasm/post.js

echo "Build complete."
