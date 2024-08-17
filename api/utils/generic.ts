import fs from 'fs';

export const createUserSpace = (sessionID:string) => {

    const userDir = `api/users/${sessionID}`;
    const uploadsDir = `${userDir}/uploads/`;
    const outputDir = `${userDir}/output/`;

    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir);
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

}