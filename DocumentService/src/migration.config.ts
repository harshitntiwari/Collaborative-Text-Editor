import * as dotenv from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";

import { getDataSourceOptions } from "./storage/DataSource.config.js";
import { CoreInterface } from "./types.js";

dotenv.config();

const Core: CoreInterface = {};
export default getDataSourceOptions(Core).then(
  async (options: DataSourceOptions) => {
    return new DataSource(options);
  }
);
