<div align="center">

<img src="https://raw.githubusercontent.com/Studio1HQ/Studio1HQ/main/assets/banners/gemini--coding-challenges.webp" alt="Gemini WASM Image Processor Challenge: A Gemini-written image filter app with C++ compiled to WebAssembly" width="100%" />

<br />
<br />

# Gemini WASM Image Processor Challenge

### A Gemini-written image filter app with C++ compiled to WebAssembly

A coding-challenge experiment: an in-browser image processor whose filters are written in C++, compiled to WebAssembly with Emscripten, and driven from a React and TypeScript UI.

<br />

[![Built by Studio1](https://img.shields.io/badge/Built_by_Studio1-f97316?style=for-the-badge&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNjAgMTYwIiBmaWxsPSJub25lIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTAgMzVDMCAxNi42ODA3IDE0LjA3NDQgMS42NDg0NCAzMiAwLjEyNjk1M1YxNDFINTEuMDUyM0M1Mi40MzA4IDEzNy4zNDQgNTQuNzQ0NiAxMzMuNjg5IDU3Ljk5MzggMTMwLjAzM0M2MS4xNDQ2IDEyNi41MDggNjQuNjg5MiAxMjMuNDQgNjguNjI3NyAxMjAuODI5QzcyLjU2NjIgMTE4LjM0OSA3Ni4zNTY5IDExNi43ODIgODAgMTE2LjEyOVY4Ni43NTQ0Qzc1LjQ3MDggODcuOTI5MiA3MS4zODQ2IDg5LjY5MTkgNjcuNzQxNSA5Mi4wNDE1QzY0IDk0LjUyMjUgNjAuNzUwOCA5Ny40NiA1Ny45OTM4IDEwMC44NTRDNTYuNTM0NSAxMDIuNzIgNTUuMjU0NSAxMDQuNjU5IDU0LjE1MzkgMTA2LjY3MVYwSDEyNUMxNDQuMzMgMCAxNjAgMTUuNjY5OSAxNjAgMzVWMTI1QzE2MCAxNDQuMzMgMTQ0LjMzIDE2MCAxMjUgMTYwSDEyNFYxOEgxMDQuOTQ4QzEwMy41NjkgMjEuNjgxNiAxMDEuMjU1IDI1LjM2MjggOTguMDA2MiAyOS4wNDQ0Qzk0Ljg1NTQgMzIuNTk0MiA5MS4zMTA4IDM1LjY4NDEgODcuMzcyMyAzOC4zMTRDODMuNDMzOCA0MC44MTIgNzkuNjQzMSA0Mi4zODk2IDc2IDQzLjA0NzRWNzIuNjMwNEM4MC41MjkyIDcxLjQ0NzMgODQuNjE1NCA2OS42NzI0IDg4LjI1ODUgNjcuMzA1N0M5MiA2NC44MDc2IDk1LjI0OTIgNjEuODQ5MSA5OC4wMDYyIDU4LjQzMDdDOTkuNDY1NSA1Ni41NTEzIDEwMC43NDUgNTQuNTk4NiAxMDEuODQ2IDUyLjU3MjNWMTYwSDM1QzE1LjY3IDE2MCAwIDE0NC4zMyAwIDEyNVYzNVoiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4K)](https://studio1hq.com)

[More examples](https://github.com/Studio1HQ) &nbsp;·&nbsp; [studio1hq.com](https://studio1hq.com)

</div>

<br />

## Overview

This repo holds the output of a coding challenge given to a Gemini model: build a browser image processor where the pixel work runs in WebAssembly. The filters are written in C++, compiled with Emscripten, and called from a React and TypeScript front end that loads an image onto a canvas.

It is an experiment, useful as a reference for how a model-generated C++ to WASM pipeline is wired into a Vite app. It is not a maintained library.

## Features

- **Upload and preview**: load an image from disk and draw it to a canvas.
- **C++ filters in WASM**: grayscale, invert, sharpen, blur and edge detect run as exported WebAssembly functions (`_grayscale`, `_invert`, `_sharpen`, `_blur`, `_edgeDetect`).
- **Filter stacking**: each filter runs on the current canvas state, so filters can be applied one after another.
- **Timing readout**: the UI reports how long each filter took in milliseconds.
- **Memory handling**: image bytes are copied into the WASM heap with `_malloc`, processed in place, and freed afterwards.

## Tech stack

| Layer | Tool |
| --- | --- |
| UI | [React](https://react.dev) 19 with TypeScript |
| Build tool | [Vite](https://vite.dev) |
| Styling | [Tailwind CSS](https://tailwindcss.com) 3 |
| Image engine | C++ compiled to WebAssembly with [Emscripten](https://emscripten.org) |

## Getting started

### Prerequisites

- Node.js 20 or later and npm
- The [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html) with `emcc` on your PATH, only if you want to rebuild the WASM module. Prebuilt `public/filters.js` and `public/filters.wasm` are already in the repo.

### Installation

```bash
git clone https://github.com/Studio1HQ/gemini--coding-challenges.git
cd gemini--coding-challenges/"Test 3"
npm install
```

### Environment variables

None. The app runs fully in the browser.

### Run

Rebuild the WASM module (optional):

```bash
bash wasm/build.sh
```

Start the dev server:

```bash
npm run dev
```

Other scripts: `npm run build` (type-check and production build), `npm run lint`, `npm run preview`.

## How it works

```text
Test 3/
├── wasm/
│   ├── filters.cpp        # grayscale, invert, sharpen, blur, edgeDetect
│   ├── post.js            # Emscripten post-js hook
│   └── build.sh           # emcc -O3 build to public/filters.js + filters.wasm
├── public/                # compiled filters.js and filters.wasm
└── src/
    ├── hooks/useWasm.ts           # loads the WASM module
    └── components/ImageProcessor.tsx  # canvas, buttons, filter calls
```

`build.sh` compiles `filters.cpp` with `-O3`, exports the filter functions plus `_malloc` and `_free`, and enables memory growth. `useWasm` loads the module once. `ImageProcessor` reads pixels from the canvas, copies them to the WASM heap, calls the chosen filter, and writes the result back.

## Resources

- [Emscripten documentation](https://emscripten.org/docs/): compiling C and C++ to WebAssembly.
- [Vite](https://vite.dev): the build tool used for the front end.
- [gpt-5.2-test](https://github.com/Studio1HQ/gpt-5.2-test): the same style of challenge run with a different model.

<br />

---

<div align="center">

<a href="https://studio1hq.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Studio1HQ/website/main/brand/studio1-logo-on-dark.svg" />
    <img src="https://raw.githubusercontent.com/Studio1HQ/website/main/brand/studio1-logo-on-light.svg" alt="Studio1" width="160" />
  </picture>
</a>

Built by **[Studio1](https://studio1hq.com)**, the technical content and DevRel partner for devtool teams.<br />
Browse more open-source examples at [github.com/Studio1HQ](https://github.com/Studio1HQ).

[![Website](https://img.shields.io/badge/studio1hq.com-0b0807?style=for-the-badge&logo=googlechrome&logoColor=white)](https://studio1hq.com)
[![Book a call](https://img.shields.io/badge/Book_a_strategy_call-f97316?style=for-the-badge&logo=googlecalendar&logoColor=white)](https://cal.com/studio1/collab)
[![X](https://img.shields.io/badge/%40Studio1HQ-141414?style=for-the-badge&logo=x&logoColor=white)](https://x.com/Studio1HQ)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/studio1hq/)

<sub><a href="https://studio1hq.com">studio1hq.com</a> · Technical content, docs, video and DevRel for devtools</sub>

</div>
