export interface CreateMeasureDTO {
    measureType: "WATER" | "GAS";
    customerCode: string;
    imageUrl: string;
    measureDatetime: Date;
    measureValue: number;
}
