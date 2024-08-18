import { Router } from 'express';
import fs from 'fs';
import convert from '../utils/convert';
import uploadMiddleware from '../utils/upload';
import { conversionResponse, getFileInputOutputPaths, niceBytes } from '../utils/generic';
import { ConvertedFileInfo } from '../utils/types';

const mainRoute = Router();

/**
 * @swagger
 * /  :
 *   get:
 *     description: Returns a list of users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
mainRoute.get('/', (req: any, res) => {
	res.send('main api route works');
});

mainRoute.post('/upload', uploadMiddleware, async (req: any, res) => {
	try {
		const userDir = `api/users/${req.sessionID}`;
		const uploadsDir = `${userDir}/uploads/`;

		fs.readdir(uploadsDir, async (err: any, files: any[]) => {
			if (err) {
				console.log(err);
			} else {
				// Convert all files to WebP using promises
				const conversionPromises = files.map(file => {
					const { inputPath, outputPath } = getFileInputOutputPaths(userDir, file);
					return convert(inputPath, outputPath);
				});

				// Wait for all conversions to complete
				await Promise.all(conversionPromises);

				// Generate response after all conversions are done
				const data: ConvertedFileInfo[] = conversionResponse(req.files, userDir);

				res.json({ data, message: `${req.files?.length} files uploaded successfully!` });
			}
		});
	} catch (err) {
		console.log('final error', err);
		res.send({ err });
	}
});

export default mainRoute;
