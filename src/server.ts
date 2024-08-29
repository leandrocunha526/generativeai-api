import express from "express";
import morgan from "morgan";
import DataSourceApplication from "./database";

import router from "./routes";

import dotenv from "dotenv";

dotenv.config();

const app = express();

// Setup the logger
app.use(morgan("combined"));
app.use(morgan("dev")); // Logs to the console

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(router);

const PORT = process.env.PORT || 3000;

DataSourceApplication.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error(
            "An error occurred while initializing the data source, error description:",
            error
        );
    });
