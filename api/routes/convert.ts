import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import convert from '../utils/convert';
import uploadMiddleware from '../utils/upload';
import { conversionResponse, getFileInputOutputPaths } from '../utils/generic';
import { ConvertedFileInfo } from '../utils/types';

const convertRoute = Router();

/**
 * Helper function to get the user's directory based on session ID
 * @param sessionID - The session ID of the user
 * @returns The path to the user's directory
 */
const getUserDirectory = (sessionID: string): string => {
	return `tmp/${sessionID}`;
};

/**
 * Helper function to convert uploaded files to WebP format
 * @param userDir - The user's directory
 * @param files - List of files to be converted
 */
const convertFilesToWebP = async (userDir: string, files: string[]): Promise<void[]> => {
	const conversionPromises = files.map(file => {
		const { inputPath, outputPath } = getFileInputOutputPaths(userDir, file);
		return convert(inputPath, outputPath);
	});
	return Promise.all(conversionPromises);
};

/**
 * @swagger
 * /convert/upload:
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
convertRoute.post('/convert', uploadMiddleware, async (req: Request, res: Response) => {
	try {
		const userDir = getUserDirectory(req.sessionID);
		const uploadsDir = path.join(userDir, 'uploads');

		// Read the uploaded files directory
		const files = await fs.promises.readdir(uploadsDir);

		// Convert files to WebP
		await convertFilesToWebP(userDir, files);

		// Generate response after conversions are done
		const data: ConvertedFileInfo[] = conversionResponse(
			userDir,
			req.files as unknown as File[]
		);

		res.json({ data, message: `${req.files?.length} files uploaded successfully!` });
	} catch (err) {
		console.error('Error during file conversion:', err);
		res.status(500).json({
			err: 'An error occurred during file conversion. Please try again later.',
		});
	}
});

export default convertRoute;
