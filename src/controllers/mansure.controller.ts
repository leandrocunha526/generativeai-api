import { Request, Response } from "express";
import { MeasureService } from "../services/measure.service";
import { GeminiService } from "../services/generativeai.service";

const geminiService = new GeminiService(process.env.GEMINI_API_KEY as string);
const measureService = new MeasureService();
export class MeasureController {
    async upload(req: Request, res: Response) {
        try {
            const { customer_code, image, measure_datetime, measure_type } =
                req.body;

            const imageUri = await geminiService.uploadImage(
                image,
                "image/png",
                "Image in PNG"
            );

            const measureValueString =
                await geminiService.generateContentWithImage(
                    imageUri,
                    "image/png",
                    `Read from the image, in numerical values, extract the quantity, the return should be just a number indicating the quantity of elements requested ${measure_type}`
                );

            const measureValue = parseFloat(measureValueString);

            if (isNaN(measureValue)) {
                throw new Error(
                    "The extracted measure value is not a valid number"
                );
            }

            const measure = await measureService.createMeasure({
                customerCode: customer_code,
                measureDatetime: new Date(measure_datetime),
                measureType: measure_type,
                imageUrl: imageUri,
                measureValue,
            });

            return res.status(200).json({
                image_url: measure.imageUrl,
                measure_value: measure.measureValue,
                measure_uuid: measure.id,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === "DOUBLE_REPORT") {
                    return res.status(409).json({
                        error_code: "DOUBLE_REPORT",
                        error_description: "Leitura do mês já realizada",
                    });
                }
                return res.status(400).json({
                    error_code: "INVALID_DATA",
                    error_description: error.message,
                });
            }
            return res.status(500).json({
                error_code: "SERVER_ERROR",
                error_description: "Ocorreu um erro inesperado",
            });
        }
    }

    async list(req: Request, res: Response) {
        try {
            const { customerCode } = req.params;
            const { measure_type } = req.query;
            if (
                !measure_type ||
                (measure_type !== "WATER" && measure_type !== "GAS")
            ) {
                return res.status(400).json({
                    error_code: "INVALID_TYPE",
                    error_description: "Tipo de medição não permitida",
                });
            }

            const measures = await measureService.listMeasures(
                customerCode,
                measure_type as "WATER" | "GAS"
            );

            if (!measures.length) {
                return res.status(404).json({
                    error_code: "MEASURES_NOT_FOUND",
                    error_description: "Nenhuma leitura encontrada",
                });
            }

            return res.status(200).json({
                customer_code: customerCode,
                measures,
            });
        } catch (error) {
            console.error("Error in list method:", error);
            if (error instanceof Error) {
                return res.status(400).json({
                    error_code: "INVALID_DATA",
                    error_description: error.message,
                });
            }
            return res.status(500).json({
                error_code: "SERVER_ERROR",
                error_description: "Ocorreu um erro inesperado",
            });
        }
    }

    async confirm(req: Request, res: Response) {
        try {
            const { measure_uuid, confirmed_value } = req.body;

            await measureService.confirmMeasure(measure_uuid, confirmed_value);

            return res.status(200).json({ success: true });
        } catch (error) {
            if (error instanceof Error) {
                // if not found
                if (error.message === "MEASURE_NOT_FOUND") {
                    return res.status(404).json({
                        error_code: "MEASURE_NOT_FOUND",
                        error_description: "Leitura do mês já realizada",
                    });
                }

                // if duplicate
                if (error.message === "CONFIRMATION_DUPLICATE") {
                    return res.status(409).json({
                        error_code: "CONFIRMATION_DUPLICATE",
                        error_description: "Leitura do mês já realizada",
                    });
                }

                // if data is invalid
                return res.status(400).json({
                    error_code: "INVALID_DATA",
                    error_description: error.message,
                });
            }

            // internal server error
            return res.status(500).json({
                error_code: "SERVER_ERROR",
                error_description: "Ocorreu um erro inesperado",
            });
        }
    }
}
