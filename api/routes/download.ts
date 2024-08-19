import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const downloadRoute = Router();

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
downloadRoute.get('/download/:path', async (req: Request, res: Response) => {
	try {
		const { path } = req.params;
		console.log('path', path);
		// Check if the file exists
		if (fs.existsSync(path)) {
			// Send the file to the client
			res.download(path, err => {
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

export default downloadRoute;
