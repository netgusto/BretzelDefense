const path = require('node:path');
const { transformAsync } = require('@babel/core');
const { defineConfig } = require('vite');

function flowStripPlugin() {
    return {
        name: 'flow-strip-plugin',
        async transform(code, id) {
            if(!id.endsWith('.js') || id.includes('/node_modules/')) {
                return null;
            }

            const result = await transformAsync(code, {
                filename: id,
                babelrc: false,
                configFile: false,
                sourceMaps: true,
                plugins: ['@babel/plugin-transform-flow-strip-types']
            });

            if(!result) {
                return null;
            }

            return {
                code: result.code,
                map: result.map || null
            };
        }
    };
}

module.exports = defineConfig({
    publicDir: 'public',
    define: {
        global: 'globalThis'
    },
    optimizeDeps: {
        noDiscovery: true,
        include: [
            'bezier-js',
            'clone',
            'compose-js',
            'easystarjs',
            'gl-matrix',
            'javascript-astar',
            'javascript-state-machine',
            'keyboardjs',
            'merge',
            'p2',
            'perfnow',
            'pixi.js',
            'sat',
            'screenfull',
            'stampit',
            'tiny-emitter',
            'typedarray'
        ],
        esbuildOptions: {
            define: {
                global: 'globalThis'
            }
        }
    },
    server: {
        host: '0.0.0.0',
        port: 8080
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: path.resolve(__dirname, 'index.html')
        }
    },
    resolve: {
        alias: [
            { find: /^fs$/, replacement: path.resolve(__dirname, 'src/shims/empty.js') },
            { find: /^path$/, replacement: 'path-browserify' }
        ]
    },
    plugins: [flowStripPlugin()]
});
