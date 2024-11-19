import {configDotenv} from "dotenv";

configDotenv();

import {defineConfig} from '@playwright/test';
import os from "os";


export default defineConfig({
    testDir: './tests',
    testMatch: 'test-*.mjs',
    timeout: 30000,
    retries: 0,
    fullyParallel: true,
    expect: {
        timeout: 20000,
    },
    reporter: 'null',
    workers: Math.max(os.cpus().length - 2, 1), // Number of parallel workers
});
