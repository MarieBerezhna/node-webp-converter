import { Router, Request, Response } from 'express';
import fs from 'fs';
import convert from '../utils/convert';
import uploadMiddleware from '../utils/upload';
import { conversionResponse, getFileInputOutputPaths } from '../utils/generic';
import { ConvertedFileInfo } from '../utils/types';
import path from 'path';

const mainRoute = Router();

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
mainRoute.get('/', (req: Request, res: Response) => {
	res.send('main api route works');
});

/**
 * @swagger
 * /download/{filename}:
 *   get:
 *     summary: Download a converted WebP file
 *     description: Downloads a specific WebP file from the output directory.
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the file to download
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */
mainRoute.get('/download/:filename', async (req: Request, res: Response) => {
	try {
		const { filename } = req.params;
		const userDir = `api/users/${req.sessionID}`;
		const outputDir = path.join(userDir, 'output');
		const filePath = path.join(outputDir, filename);

		// Check if the file exists
		if (fs.existsSync(filePath)) {
			// Send the file to the client
			res.download(filePath, filename, err => {
				if (err) {
					console.log('Error in downloading file:', err);
					res.status(500).send({ err: 'Failed to download file.' });
				}
			});
		} else {
			// File not found
			res.status(404).send({ err: 'File not found.' });
		}
	} catch (err) {
		console.log('final error', err);
		res.status(500).send({ err: 'An error occurred while processing your request.' });
	}
});

export default mainRoute;
