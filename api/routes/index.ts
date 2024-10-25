import { Router } from 'express';
import testRoute from './test';
import convertRoute from './convert';
import downloadRoute from './download';

const routes = Router();

routes.use(testRoute); // main "/" path
routes.use(convertRoute); // "/convert"
routes.use(downloadRoute); // "/download/<path-to-file>"

export default routes;
