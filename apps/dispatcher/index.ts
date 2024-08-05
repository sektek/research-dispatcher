import { telemetry } from './src/instrumentation.js';
// eslint-disable-next-line sort-imports
import { HttpServer } from '@sektek/common';
import { app as dispatcherApp } from './src/app.js';

telemetry.start();

const server = new HttpServer(dispatcherApp);
server.start();
