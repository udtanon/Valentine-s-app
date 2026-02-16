import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Cast process to any to avoid TypeScript error about missing cwd() definition in the default environment types
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This allows process.env.API_KEY to work in the browser
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});