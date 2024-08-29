import { Measure } from "../entities/measure.entities";

import DataSourceApplication from "../database";

export const RepositoryMeasure = DataSourceApplication.getRepository(Measure);
