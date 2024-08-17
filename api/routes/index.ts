import { Router } from 'express';
import mainRoute from './main';
import testRoute from './test';
  
const routes = Router();

routes.use(testRoute);
routes.use(mainRoute);


export default routes;

