import * as fs from 'fs/promises';

const devServiceWorkerPlugin = () => {
  return {
    name: 'vite-dev-server-sw',
    apply: 'serve',
    enforce: 'pre',
    resolveId(id) {
      return id === '/vite-sw-dev-server.js'
        ? id.replace('.js', '.ts')
        : undefined;
    },
    async load(id) {
      if (id === '/vite-sw-dev-server.ts') {
        return await fs.readFile('./src/devServiceWorker.ts', 'utf-8');
      }
    },
    async transformIndexHtml(html) {
      const loadDevServiceWorkerSrc = await fs.readFile(
        './src/loadDevServiceWorker.ts',
        'utf-8'
      );
      return [
        {
          tag: 'script',
          attrs: {
            type: 'module',
          },
          children: loadDevServiceWorkerSrc,
        },
      ];
    },
  } as const;
};

export default devServiceWorkerPlugin;
