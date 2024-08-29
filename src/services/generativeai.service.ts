import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

export class GeminiService {
    private fileManager: GoogleAIFileManager;
    private generativeAI: GoogleGenerativeAI;

    constructor(apiKey: string) {
        this.fileManager = new GoogleAIFileManager(apiKey);
        this.generativeAI = new GoogleGenerativeAI(apiKey);
    }

    private decodeBase64Image(dataString: string, outputPath: string): void {
        const matches = dataString.match(
            /^(data:image\/[A-Za-z-+/]+;base64,)?(.+)$/
        );
        if (!matches || matches.length < 2) {
            throw new Error("The base64 image string is invalid");
        }

        const imageBuffer = Buffer.from(matches[2], "base64");
        fs.writeFileSync(outputPath, imageBuffer);
    }

    async uploadImage(
        base64Image: string,
        mimeType: string,
        displayName: string
    ): Promise<string> {
        try {
            const tempFilePath = path.join(__dirname, `${displayName}.jpg`);
            this.decodeBase64Image(base64Image, tempFilePath);

            const uploadResponse = await this.fileManager.uploadFile(
                tempFilePath,
                {
                    mimeType,
                    displayName,
                }
            );

            fs.unlinkSync(tempFilePath);

            return uploadResponse.file.uri;
        } catch (error) {
            throw new Error("Failed to upload the image");
        }
    }

    async checkFileState(fileName: string) {
        try {
            let file = await this.fileManager.getFile(fileName);
            while (file.state === FileState.PROCESSING) {
                process.stdout.write(".");
                await new Promise((resolve) => setTimeout(resolve, 10_000));
                file = await this.fileManager.getFile(fileName);
            }

            if (file.state === FileState.FAILED) {
                throw new Error("The file processing failed");
            }

            console.log(
                `The file ${file.displayName} is ready for inference as ${file.uri}`
            );
            return file.uri;
        } catch (error) {
            throw new Error("The check the file state failed");
        }
    }

    async generateContentWithImage(
        imageUri: string,
        mimeType: string,
        prompt: string
    ) {
        try {
            const model = this.generativeAI.getGenerativeModel({
                model: "gemini-1.5-pro",
            });

            const result = await model.generateContent([
                {
                    fileData: {
                        mimeType,
                        fileUri: imageUri,
                    },
                },
                { text: prompt },
            ]);
            return result.response.text();
        } catch (error) {
            throw new Error("Failed to generate the content");
        }
    }
}
