import multer, { diskStorage } from 'multer';
import fs from 'fs';

// Set up storage for uploaded files
const storage = diskStorage({
    destination: (req: any, _file: any, cb: (arg0: null, arg1: string) => void) => {
        const dir = `api/users/${req.sessionID}/uploads`;

        console.log(dir);
        if (!fs.existsSync(dir))  fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req: any, file: { originalname: string; }, cb: (arg0: null, arg1: string) => void) => {

        cb(null, file.originalname);
    }
});

// Create the multer instance
const upload = multer({ storage: storage });

export default upload;