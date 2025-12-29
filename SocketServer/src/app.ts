import * as http from "http";
import * as dotenv from "dotenv";

dotenv.config();

import { SocketServer } from "./socket/SocketServer.js";
import * as utils from "./utils/index.js";
import * as controller from "./controller/index.js";
import { CoreInterface } from "./types.js";

let server: http.Server;
let socketServer: SocketServer;

const Core: CoreInterface = {};

async function initCoreModules() {
  server = http.createServer();
  socketServer = new SocketServer(server);

  Core.io = socketServer.getIO();

  await utils.init(Core);
  await controller.init(Core);
}

async function startCoreModules() {
  const host: any = process.env.HOST;
  const port: any = process.env.PORT;

  socketServer.start(Core);

  server.on("error", (err) => {
    console.log(err);
    process.exit(1);
  });

  server.listen(port, host, () => {
    process.title = "Socket Server";
    console.log(`${process.title} started at ${host}:${port}`);
  });
}

initCoreModules().then(() => {
  startCoreModules();
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close();
  process.exit(0);
});
