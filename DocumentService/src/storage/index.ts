import { DataSource } from "typeorm";

import { CoreInterface, StorageInterface } from "../types.js";
import { getDataSourceOptions } from "./DataSource.config.js";
import { DocumentOperations } from "./Document.js";

let store: StorageInterface;
async function init(Core: CoreInterface) {
  const log = Core.logger;
  const maxRetries = 10;
  const retryDelay = 2000; // 2 seconds
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
      return;
    } catch (err: any) {
      log?.info(
        `Database connection attempt ${attempt}/${maxRetries} failed: ${err.message}`
      );
      if (attempt === maxRetries) {
        log?.error("Failed to connect to database after all retries");
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
}

export { init, store, DocumentOperations };
