import { defineConfig } from 'tsup';

export default defineConfig({
    format: ['cjs', 'esm'],
    entry: ["src/**/*.ts"],
    dts: true,
    shims: true,
    skipNodeModulesBundle: true,
    clean: true,
    splitting: true,
    target: 'es2020',
});
