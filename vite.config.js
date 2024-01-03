import { importChunkUrl } from 'vite-plugin-import-chunk-url';

export default defineConfig(({ command, mode, ssrBuild }) => {
  return {
    plugins: [
      importChunkUrl(),
    ],
    build: {
      minify: false,
      sourcemap: true,
    }
  };
});