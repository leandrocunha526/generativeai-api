import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
} from "typeorm";

@Entity()
export class Measure extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    measureType: "WATER" | "GAS";

    @Column({ type: "float" })
    measureValue: number;

    @Column({ type: "boolean", default: false })
    hasConfirmed: boolean;

    @Column("timestamptz")
    measureDatetime: Date;

    @Column({ type: "text" })
    imageUrl: string;

    @Column({ type: "varchar", length: 50 })
    customerCode: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
