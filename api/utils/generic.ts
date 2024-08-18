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

export const niceBytes = (x: string) => {
	const units = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
	let l = 0,
		n = parseInt(x, 10) || 0;

	while (n >= 1024 && ++l) {
		n = n / 1024;
	}

	return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l];
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

export const conversionResponse = (files: any[], userDir: string) => {
	const response: ConvertedFileInfo[] = [];

	files.forEach((file: any) => {
		const { filename } = file;
		const originalSize = niceBytes(file.size);
		const { outputPath } = getFileInputOutputPaths(userDir, filename);
		const { size: webpSize } = fs.statSync(outputPath);

		const size = niceBytes(webpSize.toString());

		const fileinfo = {
			filename,
			originalSize,
			size,
		};

		response.push(fileinfo);
	});

	return response;
};
