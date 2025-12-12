import { ImageProcessor } from './components/ImageProcessor';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-10">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent mb-2">
          Supercharged
        </h1>
        <p className="text-slate-400">High-Performance Browser Image Processing</p>
      </header>

      <main className="w-full px-4">
        <ImageProcessor />
      </main>

      <footer className="mt-12 text-slate-600 text-sm">
        Powered by C++ & WebAssembly
      </footer>
    </div>
  );
}

export default App;
