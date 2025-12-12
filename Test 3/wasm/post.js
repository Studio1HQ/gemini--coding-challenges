// Ensure HEAPU8 is available on Module, using a getter to handle memory growth
if (!Module.HEAPU8) {
    Object.defineProperty(Module, 'HEAPU8', {
        get: function () {
            return HEAPU8;
        }
    });
}
