import * as http from "http";
import * as dotenv from "dotenv";

dotenv.config();

import * as controller from "./controller/index.js";
import { API } from "./api/index.js";

let server: http.Server;

async function initCoreModules() {
  await controller.init();
  const api = new API(controller.Core);

  server = http.createServer(api.app);
}

async function startCoreModules() {
  const host: any = process.env.HOST;
  const port: any = process.env.PORT;

  server.on("error", (err) => {
    console.log(err);
    process.exit(1);
  });

  server.listen(port, host, () => {
    process.title = "Document Service";
    controller.Core.logger?.info(
      `${process.title} listening at ${host}:${port}`
    );
  });
}

initCoreModules()
  .then(() => {
    startCoreModules();
  })
  .catch((err) => {
    console.error("Failed to initialize DocumentService:", err);
    process.exit(1);
  });

process.on("SIGINT", () => {
  controller.close().then(() => {
    process.exit(0);
  });
});
