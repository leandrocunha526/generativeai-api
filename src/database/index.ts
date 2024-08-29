import { DataSource } from "typeorm";
import { Measure } from "../entities/measure.entities";

const DataSourceApplication = new DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOST, // container name is postgres
    port: Number(process.env.DATABASE_PORT), // default port is 5432
    username: process.env.DATABASE_USERNAME, // default is postgres
    password: process.env.DATABASE_PASSWORD, // password is not have a default
    database: process.env.DATABASE_NAME, // database name is your choose name
    entities: [Measure],
    synchronize: true,
});

export default DataSourceApplication;
