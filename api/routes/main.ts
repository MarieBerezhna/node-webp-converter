import { Router } from 'express';
import upload from '../utils/upload';
import fs from 'fs';
import convert from '../utils/convert';
import { createUserSpace } from '../utils/generic';

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
	console.log(req.sessionID);
	res.send('main api route works');
});

mainRoute.post(
	'/upload',
	//  upload,
	(req: any, res) => {
		try {
			createUserSpace(req.sessionID);

			upload(req, res, err => {
				if (!err) {
					if (req.files?.length) {
						console.log(req.files);
						// Handle the uploaded file
						res.json({ message: 'File uploaded successfully!' });
					}
				} else {
					res.send({ err });
				}
			});
		} catch (err) {
			res.send({ err });
		}
	}
);

mainRoute.get('/convert', (req: any, res) => {
	const userDir = `api/users/${req.sessionID}`;
	const uploadsDir = `${userDir}/uploads/`;
	const outputDir = `${userDir}/output/`;

	if (!fs.existsSync(uploadsDir)) res.json({ message: 'convert! - empty' });
	if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

	fs.readdir(uploadsDir, (err: any, files: any[]) => {
		if (err) console.log(err);
		else {
			files.forEach(file => {
				const ext = file.split('.').pop();
				const filename = file.replace(`.${ext}`, '');
				const inputPath = `${uploadsDir}${file}`;
				const outputPath = `${outputDir}${filename}.webp`;

				convert(inputPath, outputPath);
			});
		}
	});

	res.json({ message: 'convert!' });
});

export default mainRoute;
