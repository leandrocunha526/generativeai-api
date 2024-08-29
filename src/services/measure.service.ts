import { Between } from "typeorm";
import { RepositoryMeasure } from "../repositories/measure.repository";
import { Measure } from "../entities/measure.entities";
import { CreateMeasureDTO } from "./interfaces/CreateMeasureDTO";

export class MeasureService {
    async createMeasure(data: CreateMeasureDTO): Promise<Measure> {
        const startOfMonth = new Date(
            data.measureDatetime.getFullYear(),
            data.measureDatetime.getMonth(),
            1
        );
        const endOfMonth = new Date(
            data.measureDatetime.getFullYear(),
            data.measureDatetime.getMonth() + 1,
            0
        );

        const existingMeasure = await RepositoryMeasure.findOne({
            where: {
                customerCode: data.customerCode,
                measureType: data.measureType,
                measureDatetime: Between(startOfMonth, endOfMonth),
            },
        });

        if (existingMeasure) {
            throw new Error("DOUBLE_REPORT");
        }

        const measure = RepositoryMeasure.create(data);
        await RepositoryMeasure.save(measure);
        return measure;
    }

    async confirmMeasure(id: string, confirmedValue: number): Promise<void> {
        const measure = await RepositoryMeasure.findOne({ where: { id } });

        if (!measure) {
            throw new Error("MEASURE_NOT_FOUND");
        }

        if (measure.hasConfirmed) {
            throw new Error("CONFIRMATION_DUPLICATE");
        }

        measure.measureValue = confirmedValue;
        measure.hasConfirmed = true;
        await RepositoryMeasure.save(measure);
    }

    async listMeasures(
        customerCode: string,
        measureType?: "WATER" | "GAS"
    ): Promise<Measure[]> {
        const query = RepositoryMeasure.createQueryBuilder("measure").where(
            "measure.customerCode = :customerCode",
            { customerCode }
        );

        if (measureType) {
            query.andWhere("measure.measureType = :measureType", {
                measureType,
            });
        }

        return query.getMany();
    }
}
