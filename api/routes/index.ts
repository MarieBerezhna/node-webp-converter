import { Router } from 'express';
import mainRoute from './main';
import testRoute from './test';
import convertRoute from './convert';

const routes = Router();

routes.use(testRoute);
routes.use(mainRoute);
routes.use(convertRoute);

export default routes;
