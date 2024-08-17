import { Router } from 'express';

const testRoute = Router();

testRoute.get('/test', (req, res) => {
    res.send('test api route works');
});
  

  export default testRoute;