import fs from 'fs/promises'; // Use promises API for async operations
import { statSync, readdirSync, rmSync, mkdirSync } from 'fs'; // Sync operations
import { ConvertedFileInfo } from './types';
import path from 'path';
import { getUserDirectory } from '../routes/convert';

export const createUserSpace = async (sessionID: string) => {
	const userDir = getUserDirectory(sessionID);
	const uploadsDir = path.join(userDir, 'uploads');
	const outputDir = path.join(userDir, 'output');

	// Create directories recursively
	await fs.mkdir(userDir, { recursive: true });
	await fs.mkdir(uploadsDir, { recursive: true });
	await fs.mkdir(outputDir, { recursive: true });
};

export const removeUserSpace = (sid: string) => {
	const userDir = path.join('/tmp', sid);
	rmSync(userDir, { recursive: true, force: true });
};

export const cleanInactiveSpaces = (sessions: string[]) => {
	const usersDir = 'tmp';

	readdirSync(usersDir).map(sid => {
		if (sessions.indexOf(sid) === -1) {
			removeUserSpace(sid);
		}
	});
};

export const getFileInputOutputPaths = (userDir: string, fileName: string) => {
	const uploadsDir = path.join(userDir, 'uploads');
	const outputDir = path.join(userDir, 'output');

	const ext = path.extname(fileName);
	const filename = path.basename(fileName, ext);
	const inputPath = path.join(uploadsDir, fileName);
	const outputPath = path.join(outputDir, `${filename}.webp`);

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
		const { size } = statSync(outputPath);

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
