import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory or parent.
  const env = { ...loadEnv(mode, process.cwd(), ''), ...loadEnv(mode, '../', '') };
  const baseURL = env.Base_URL || env.VITE_BASE_URL || 'https://dev.matadortrust.com/v2';

  return {
    define: {
      'process.env.Base_URL': JSON.stringify(baseURL),
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
    },
  };
});
