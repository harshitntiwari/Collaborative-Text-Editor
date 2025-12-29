import { DataSource } from "typeorm";

import { CoreInterface, StorageInterface } from "../types.js";
import { getDataSourceOptions } from "./DataSource.config.js";
import { DocumentOperations } from "./Document.js";

let store: StorageInterface;
async function init(Core: CoreInterface) {
  const log = Core.logger;
  try {
    const dataSourceOptions = await getDataSourceOptions(Core);
    const AppDataSource = new DataSource(dataSourceOptions);
    await AppDataSource.initialize();
    log?.info("Connected to database successfully!");

    const documentOperations = new DocumentOperations(Core, AppDataSource);

    store = {
      get document() {
        return documentOperations;
      },
    };
  } catch (err: any) {
    log?.info(`Database connection failed with error: ${err.message}`);
    throw err;
  }
}

export { init, store, DocumentOperations };
