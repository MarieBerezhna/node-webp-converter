import multer, { StorageEngine } from 'multer';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { createUserSpace } from './generic';

// Configure multer storage and file name
const storage: StorageEngine = multer.diskStorage({
	destination: (req, file, cb) => {
		createUserSpace(req.sessionID);
		const dir  = `api/users/${req.sessionID}/uploads`;
	  cb(null, dir);
	},
	filename: (req, file, cb) => {
	  cb(null, file.originalname);
	}
  });
  
  // Create multer upload instance
  const upload = multer({ storage: storage });

const uploadMiddleware = (req: Request, res: Response, next: NextFunction): void => {
	upload.array('files', 5)(req, res, (err) => {
	  if (err) {
		return res.status(400).json({ error: err.message });
	  }
  
	  // Check what files have been uploaded
	  console.log('Uploaded files:', req.files);
  
	  const files = req.files as Express.Multer.File[];
	  const errors: string[] = [];
  
	  files.forEach((file) => {
		const allowedTypes = ['image/jpeg', 'image/png'];
		const maxSize = 5 * 1024 * 1024; // 5MB
  
		if (!allowedTypes.includes(file.mimetype)) {
		  errors.push(`Invalid file type: ${file.originalname}`);
		}
  
		if (file.size > maxSize) {
		  errors.push(`File too large: ${file.originalname}`);
		}
	  });
  
	  if (errors.length > 0) {
		files.forEach((file) => {
		  fs.unlinkSync(file.path);
		});
  
		return res.status(400).json({ errors });
	  }
  
	  req.files = files;
  
	  next();
	});
  };

  export default uploadMiddleware;