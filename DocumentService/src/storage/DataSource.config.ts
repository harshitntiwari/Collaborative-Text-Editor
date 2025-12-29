import { DataSourceOptions } from "typeorm";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { CoreInterface } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function getDataSourceOptions(
  _Core: CoreInterface
): Promise<DataSourceOptions> {
  const dataSourceOptions: DataSourceOptions = {
    type: process.env.DB_TYPE as any,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT as any,
    database: "documentDB",
    synchronize: false,
    entities: [__dirname + "/entities/*.js"],
    migrations: [__dirname + "/migrations/*.js"],
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  };

  return dataSourceOptions;
}
