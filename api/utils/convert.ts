import sharp from 'sharp';

const convert = async function (inputPath: string, outputPath: string) {

        try {
            await sharp(inputPath)
                .webp({ quality: 100 })
                .toFile(outputPath);
        } catch (error) {
            console.error(`Error converting file:`, error);
        }

}

export default convert;