import { Router } from 'express';

const testRoute = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Main API route
 *     description: Returns a message indicating that the main API route is working.
 *     responses:
 *       200:
 *         description: A success message
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: main api route works
 */

testRoute.get('/', (req, res) => {
	res.send('test api route works');
});

export default testRoute;
