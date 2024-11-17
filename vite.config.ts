import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      proxy: {
        '/pdl-api': {
          target: 'https://api.peopledatalabs.com/v5',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/pdl-api/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Add the API key as a header
              proxyReq.setHeader('X-Api-Key', env.VITE_PDL_API_KEY || '');
              
              // Remove problematic headers
              proxyReq.removeHeader('User-Agent');
              proxyReq.removeHeader('Origin');
              
              // Add required headers
              proxyReq.setHeader('Accept', 'application/json');
              proxyReq.setHeader('Content-Type', 'application/json');
              proxyReq.setHeader('Accept-Encoding', 'gzip');
            });

            proxy.on('error', (err, req, res) => {
              console.error('Proxy error:', err);
              if (!res.headersSent) {
                res.writeHead(500, {
                  'Content-Type': 'application/json',
                });
              }
              res.end(JSON.stringify({ message: 'Proxy error occurred', error: err.message }));
            });
          }
        }
      }
    }
  };
});