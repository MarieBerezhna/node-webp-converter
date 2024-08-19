import { Router, Request, Response } from 'express';
import fs from 'fs';
import convert from '../utils/convert';
import uploadMiddleware from '../utils/upload';
import { conversionResponse, getFileInputOutputPaths } from '../utils/generic';
import { ConvertedFileInfo } from '../utils/types';

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
 * /upload:
 *   post:
 *     summary: Upload files and convert to WebP
 *     description: Accepts image files, uploads them, converts them to WebP format, and returns information about the converted files.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Files uploaded and converted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       filename:
 *                         type: string
 *                         description: The original filename of the uploaded file
 *                       originalSize:
 *                         type: string
 *                         description: The original size of the uploaded file
 *                 message:
 *                   type: string
 *                   example: "3 files uploaded successfully!"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 err:
 *                   type: string
 *                   example: "Error message here"
 */
mainRoute.post('/upload', uploadMiddleware, async (req: Request, res: Response) => {
	try {
		const userDir = `api/users/${req.sessionID}`;
		const uploadsDir = `${userDir}/uploads/`;

		fs.readdir(uploadsDir, async (err: NodeJS.ErrnoException | null, files: string[]) => {
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
				const data: ConvertedFileInfo[] = conversionResponse(
					userDir,
					req.files as unknown as File[]
				);

				res.json({ data, message: `${req.files?.length} files uploaded successfully!` });
			}
		});
	} catch (err) {
		console.log('final error', err);
		res.send({ err });
	}
});

/**
 * @swagger
 * /download:
 *   get:
 *     summary: Download files
 *     description: This is a placeholder route for downloading files. Currently, it just returns "OK".
 *     responses:
 *       200:
 *         description: Placeholder response indicating success
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: OK
 */
mainRoute.get('/download', async (req: Request, res: Response) => {
	res.send('OK');
});

export default mainRoute;
