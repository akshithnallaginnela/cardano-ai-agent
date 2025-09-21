import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const root = __dirname;
  const srcPath = path.resolve(root, 'src');
  
  console.log('Vite config loaded with mode:', mode);
  console.log('Project root:', root);
  console.log('Source path:', srcPath);
  
  return {
    root: '.',
    publicDir: 'public',
    server: {
      host: "0.0.0.0",
      port: 3001,  // Changed to port 3001
      strictPort: false,  // Allow port increment if 3001 is in use
      open: true,
      cors: true,
      hmr: {
        overlay: false
      },
      fs: {
        strict: false,
        allow: ['.', __dirname]
      },
      watch: {
        usePolling: true,
        interval: 100
      }
    },
    plugins: [
      react(),
      mode === "development" ? componentTagger() : null
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": srcPath,
      },
    },
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: path.resolve(root, 'index.html')
        }
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2020'
      }
    },
    define: {
      'process.env': process.env
    }
  };
});