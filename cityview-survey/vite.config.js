import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory or parent.
  const env = { ...loadEnv(mode, process.cwd(), ''), ...loadEnv(mode, '../', '') };
  const baseURL = env.NEXT_PUBLIC_BASE_URL || 'https://api.matadortrust.com/v2';

  return {
    define: {
      'process.env.NEXT_PUBLIC_BASE_URL': JSON.stringify(baseURL),
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
    },
  };
});
