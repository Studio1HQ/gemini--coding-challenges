#include <emscripten.h>
#include <cmath>
#include <algorithm>
#include <vector>
#include <cstdint>

extern "C" {

EMSCRIPTEN_KEEPALIVE
void grayscale(uint8_t* data, int width, int height) {
    for (int i = 0; i < width * height * 4; i += 4) {
        uint8_t r = data[i];
        uint8_t g = data[i + 1];
        uint8_t b = data[i + 2];
        // Luminosity method
        uint8_t gray = (uint8_t)(0.299f * r + 0.587f * g + 0.114f * b);
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
    }
}

EMSCRIPTEN_KEEPALIVE
void invert(uint8_t* data, int width, int height) {
    for (int i = 0; i < width * height * 4; i += 4) {
        data[i] = 255 - data[i];         // R
        data[i + 1] = 255 - data[i + 1]; // G
        data[i + 2] = 255 - data[i + 2]; // B
    }
}

// Helper for convolution
void applyKernel(uint8_t* data, int width, int height, const std::vector<float>& kernel, int kSize) {
    std::vector<uint8_t> inputCopy(data, data + width * height * 4);
    int halfK = kSize / 2;

    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            float r = 0.0f, g = 0.0f, b = 0.0f;
            
            for (int ky = -halfK; ky <= halfK; ++ky) {
                for (int kx = -halfK; kx <= halfK; ++kx) {
                    int py = std::min(std::max(y + ky, 0), height - 1);
                    int px = std::min(std::max(x + kx, 0), width - 1);
                    int pixelIdx = (py * width + px) * 4;
                    int kernelIdx = (ky + halfK) * kSize + (kx + halfK);
                    
                    r += inputCopy[pixelIdx] * kernel[kernelIdx];
                    g += inputCopy[pixelIdx + 1] * kernel[kernelIdx];
                    b += inputCopy[pixelIdx + 2] * kernel[kernelIdx];
                }
            }

            int idx = (y * width + x) * 4;
            data[idx] = (uint8_t)std::min(std::max(r, 0.0f), 255.0f);
            data[idx + 1] = (uint8_t)std::min(std::max(g, 0.0f), 255.0f);
            data[idx + 2] = (uint8_t)std::min(std::max(b, 0.0f), 255.0f);
        }
    }
}

EMSCRIPTEN_KEEPALIVE
void sharpen(uint8_t* data, int width, int height) {
    // Simple sharpen kernel
    //  0 -1  0
    // -1  5 -1
    //  0 -1  0
    std::vector<float> kernel = {
         0.0f, -1.0f,  0.0f,
        -1.0f,  5.0f, -1.0f,
         0.0f, -1.0f,  0.0f
    };
    applyKernel(data, width, height, kernel, 3);
}

EMSCRIPTEN_KEEPALIVE
void blur(uint8_t* data, int width, int height) {
    // Box blur 3x3
    float v = 1.0f / 9.0f;
    std::vector<float> kernel = {
        v, v, v,
        v, v, v,
        v, v, v
    };
    applyKernel(data, width, height, kernel, 3);
}

EMSCRIPTEN_KEEPALIVE
void edgeDetect(uint8_t* data, int width, int height) {
    // Edge detection
    // -1 -1 -1
    // -1  8 -1
    // -1 -1 -1
    std::vector<float> kernel = {
        -1.0f, -1.0f, -1.0f,
        -1.0f,  8.0f, -1.0f,
        -1.0f, -1.0f, -1.0f
    };
    applyKernel(data, width, height, kernel, 3);
}

} // extern "C"
