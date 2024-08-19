import fs from 'fs';
import { ConvertedFileInfo } from './types';

export const createUserSpace = (sessionID: string) => {
	const userDir = `tmp/${sessionID}`;
	const uploadsDir = `${userDir}/uploads/`;
	const outputDir = `${userDir}/output/`;

	// Create directories recursively
	fs.mkdirSync(userDir, { recursive: true });
	fs.mkdirSync(uploadsDir, { recursive: true });
	fs.mkdirSync(outputDir, { recursive: true });
};

export const removeUserSpace = (sid: string) => {
	const userDir = `tmp/${sid}`;
	fs.rmSync(userDir, { recursive: true, force: true });
};

export const cleanInactiveSpaces = (sessions: string[]) => {
	console.log('sessionIds', sessions);

	const usersDir = 'tmp';
	fs.readdirSync(usersDir).map(sid => {
		if (sessions.indexOf(sid) === -1) {
			removeUserSpace(sid);
		}
	});
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
