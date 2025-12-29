import * as http from "http";
import { Server, Socket } from "socket.io";

import * as events from "./events/index.js";
import { CoreInterface } from "../types.js";

export class SocketServer {
  private io: Server;
  constructor(httpServer: http.Server) {
    this.io = new Server(httpServer);
  }

  start(Core: CoreInterface) {
    this.io.on("connection", (socket: Socket) => {
      Core.socket = socket;
      events.init(Core);
    });
  }

  getIO(): Server {
    return this.io;
  }
}
