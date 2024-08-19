import fs from 'fs';
import { ConvertedFileInfo } from './types';

export const createUserSpace = (sessionID: string) => {
	const userDir = `api/users/${sessionID}`;
	const uploadsDir = `${userDir}/uploads/`;
	const outputDir = `${userDir}/output/`;

	if (!fs.existsSync(userDir)) fs.mkdirSync(userDir);
	if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
	if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
};

export const getFileInputOutputPaths = (userDir: string, fileName: string) => {
	const uploadsDir = `${userDir}/uploads/`;
	const outputDir = `${userDir}/output/`;

	const ext = fileName.split('.').pop();
	const filename = fileName.replace(`.${ext}`, '');
	const inputPath = `${uploadsDir}${fileName}`;
	const outputPath = `${outputDir}${filename}.webp`;

	return {
		inputPath,
		outputPath,
	};
};

export const conversionResponse = (userDir: string, files?: File[]) => {
	const response: ConvertedFileInfo[] = [];

	files?.forEach((file: any) => {
		const { filename } = file;
		const { outputPath } = getFileInputOutputPaths(userDir, filename);
		const { size } = fs.statSync(outputPath);

		const fileinfo = {
			filename,
			originalSize: file.size,
			size,
			outputPath,
		};

		response.push(fileinfo);
	});

	return response;
};
