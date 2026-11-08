import { defineConfig } from '@playwright/test';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
export default defineConfig({
  testDir:'tests/e2e', fullyParallel:false, workers:1, timeout:60_000,
  use:{baseURL:'http://127.0.0.1:5179',headless:true,launchOptions:{executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox']}},
  webServer:{command:'npm run dev',url:'http://127.0.0.1:5179',reuseExistingServer:false,
    env:{PORT:'3019',VITE_API_TARGET:'http://127.0.0.1:3019',VITE_PORT:'5179',DATABASE_PATH:join(tmpdir(),`contalingo-e2e-${process.pid}.sqlite`)},timeout:30_000},
});
