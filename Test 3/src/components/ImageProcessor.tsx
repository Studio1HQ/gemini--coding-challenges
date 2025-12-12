import React, { useRef, useState, useEffect } from 'react';
import { useWasm } from '../hooks/useWasm';

// Filter names mapping to Wasm functions
const FILTERS = [
    { name: 'Grayscale', func: '_grayscale' },
    { name: 'Invert', func: '_invert' },
    { name: 'Sharpen', func: '_sharpen' },
    { name: 'Blur', func: '_blur' },
    { name: 'Edge Detect', func: '_edgeDetect' },
] as const;

export const ImageProcessor: React.FC = () => {
    const { module, isLoaded, error } = useWasm();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
    const [message, setMessage] = useState<string>('');
    const [processingTime, setProcessingTime] = useState<number | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current;
                if (!canvas) return;

                // Limit size for performance/display (optional, but good for UI)
                // keeping it real size for now
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                ctx.drawImage(img, 0, 0);
                const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
                setOriginalImageData(data);
                setImageLoaded(true);
                setMessage('Image loaded. Ready to filter.');
                setProcessingTime(null);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const applyFilter = (filterName: string, filterFuncStr: string) => {
        if (!module || !isLoaded || !canvasRef.current || !originalImageData) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Always start from original to avoid compounding degradation (unless desired)
        // For this demo, let's start from the *current* state?
        // User requirement: "run filters instantly". usually implies independent filters or chained.
        // Let's implement applying on top of Current canvas state to allow chaining,
        // OR apply on original. "Previews the output" usually means toggleable.
        // Let's use current canvas state to allow stacking filters (e.g. grayscale then edge detect).

        // Actually, stacking filters on Invert -> Invert = Original. 
        // Let's pull from Canvas.
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        const imageData = ctx.getImageData(0, 0, width, height);
        const dataBytes = imageData.data; // Uint8ClampedArray

        const start = performance.now();

        try {
            const numBytes = dataBytes.length;
            const ptr = module._malloc(numBytes);
            if (!ptr) {
                setMessage('Failed to allocate Emscripten heap memory');
                return;
            }

            // Copy data to Emscripten heap (shared memory)
            module.HEAPU8.set(dataBytes, ptr);

            // Check function existence
            // @ts-ignore
            const func = module[filterFuncStr];
            if (typeof func !== 'function') {
                console.error(`Method ${filterFuncStr} missing on Module. Available keys:`, Object.keys(module));
                setMessage(`Error: Function ${filterFuncStr} not found! Check console.`);
                module._free(ptr);
                return;
            }

            console.log(`Calling ${filterFuncStr} with ptr=${ptr}, w=${width}, h=${height}`);
            func(ptr, width, height);

            // Copy result back
            const result = module.HEAPU8.subarray(ptr, ptr + numBytes);
            dataBytes.set(result); // Copy back to ImageData

            ctx.putImageData(imageData, 0, 0);
            module._free(ptr);

            const end = performance.now();
            setProcessingTime(end - start);
            setMessage(`Applied ${filterName} in ${(end - start).toFixed(2)}ms`);

        } catch (err: any) {
            console.error("Filter failed:", err);
            // Try to get a string message
            const errMsg = err?.message || err?.toString() || 'Unknown error';
            setMessage(`Error applying ${filterName}: ${errMsg}`);
        }
    };

    const resetImage = () => {
        if (!originalImageData || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            ctx.putImageData(originalImageData, 0, 0);
            setMessage('Reset to original.');
            setProcessingTime(null);
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 p-6 w-full max-w-4xl mx-auto">

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded w-full">
                    <p className="font-bold">Error Loading WASM</p>
                    <p>{error}</p>
                    <p className="text-sm mt-2">Make sure you ran <code>sh wasm/build.sh</code> and <code>npm run dev</code></p>
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-col gap-4 w-full bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">WASM Image Engine</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-mono ${isLoaded ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {isLoaded ? 'WASM READY' : 'LOADING WASM...'}
                    </span>
                </div>

                <div className="flex gap-4 items-center">
                    <label className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer transition">
                        <span>Upload Image</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>

                    {processingTime !== null && (
                        <span className="text-green-400 font-mono text-sm">
                            Processed in {processingTime.toFixed(2)}ms
                        </span>
                    )}
                    <span className="text-slate-400 text-sm ml-auto">{message}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                    {FILTERS.map(f => (
                        <button
                            key={f.name}
                            onClick={() => applyFilter(f.name, f.func)}
                            disabled={!imageLoaded || !isLoaded}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition font-medium border border-slate-600"
                        >
                            {f.name}
                        </button>
                    ))}
                    <button
                        onClick={resetImage}
                        disabled={!imageLoaded}
                        className="px-4 py-2 bg-red-900/50 hover:bg-red-900/80 disabled:opacity-50 text-red-200 rounded-lg transition ml-auto"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="relative w-full min-h-[400px] flex items-center justify-center bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                {!imageLoaded && (
                    <div className="text-slate-500 flex flex-col items-center">
                        <span className="mb-2 text-4xl">🖼️</span>
                        <span>Upload an image to start</span>
                    </div>
                )}
                <canvas
                    ref={canvasRef}
                    className={`max-w-full max-h-[80vh] object-contain ${!imageLoaded ? 'hidden' : ''}`}
                />
            </div>
        </div>
    );
};
