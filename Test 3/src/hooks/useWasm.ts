import { useState, useEffect } from 'react';

// Define the shape of our WASM module
interface WasmModule {
    _malloc: (size: number) => number;
    _free: (ptr: number) => void;
    _grayscale: (ptr: number, width: number, height: number) => void;
    _invert: (ptr: number, width: number, height: number) => void;
    _sharpen: (ptr: number, width: number, height: number) => void;
    _blur: (ptr: number, width: number, height: number) => void;
    _edgeDetect: (ptr: number, width: number, height: number) => void;
    HEAPU8: Uint8Array;
}

declare global {
    interface Window {
        Module: any;
    }
}

export const useWasm = () => {
    const [module, setModule] = useState<WasmModule | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadWasm = async () => {
            try {
                // We assume filters.js is in public/filters.js
                // Emscripten's JS glue code usually assigns to window.Module or exports a factory
                // For default Emscripten, we define Module object before loading script or it self-assigns

                // Check if script is already loaded
                if (window.Module && window.Module.onRuntimeInitialized) {
                    // Already loaded
                    if (window.Module.HEAPU8) { // basic check
                        setModule(window.Module);
                        setIsLoaded(true);
                        return;
                    }
                }

                const script = document.createElement('script');
                script.src = '/filters.js';
                script.async = true;

                // Define Module config
                window.Module = {
                    onRuntimeInitialized: () => {
                        console.log('WASM Runtime Initialized');
                        setModule(window.Module);
                        setIsLoaded(true);
                    }
                };

                script.onerror = () => {
                    setError('Failed to load WASM module (filters.js). Did you run build.sh?');
                };

                document.body.appendChild(script);
            } catch (err) {
                setError('Error loading WASM: ' + err);
            }
        };

        loadWasm();
    }, []);

    return { module, isLoaded, error };
};
