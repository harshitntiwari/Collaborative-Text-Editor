import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import Delta from "quill-delta";
import winston from "winston";

import { OT } from "./utils/OT.js";
import { MessageBroker } from "./utils/MessageBroker.js";
import {
  AckPayloadInterface,
  CoreInterface,
  DocumentControllerInterface,
} from "../types.js";

export class DocumentController implements DocumentControllerInterface {
  private log: winston.Logger;
  private ot: OT;
  private mb: MessageBroker;
  private io: Server;
  private socket: Socket;
  private editMap: Map<string, Delta>;

  constructor(Core: CoreInterface) {
    this.log = Core.logger as winston.Logger;
    this.mb = new MessageBroker(Core);
    this.ot = new OT(Core);
    this.io = Core.io as Server;
    this.socket = Core.socket as Socket;
    this.editMap = new Map<string, Delta>();
  }

  async handleEdit(payload: Record<string, any>): Promise<void> {
    try {
      const { transformedDelta, newVersion } = await this.ot.transformDelta(
        payload.documentID,
        payload.version,
        payload.delta
      );

      const editID = uuidv4();
      this.editMap.set(editID, transformedDelta);

      this.mb.pushJob("edits", "edit", {
        editID: editID,
        documentID: payload.documentID,
        delta: transformedDelta,
        version: newVersion,
      });
    } catch (err) {
      this.log.error(`DocumentController :: handleEdit : ${err}`);
      throw err;
    }
  }

  async handleAck(ackpayload: AckPayloadInterface): Promise<void> {
    try {
      const delta = this.editMap.get(ackpayload.editID);
      if (!delta) {
        throw new Error(`Delta not found for editID: ${ackpayload.editID}`);
      }
      // delta is already a Delta instance, no need to wrap it
      this.broadcastEdit(ackpayload.documentID, delta, ackpayload.version);
    } catch (err) {
      this.log.error(`DocumentController :: handleAck : ${err}`);
      throw err;
    }
  }

  private async broadcastEdit(
    documentID: string,
    delta: Delta,
    version: number
  ): Promise<void> {
    try {
      this.socket.broadcast.to(documentID).emit("document:update", {
        documentID: documentID,
        delta: delta.ops,
        version: version,
        timestamp: new Date(),
      });
    } catch (err) {
      this.log.error(`DocumentController :: broadcastEdit : ${err}`);
      throw err;
    }
  }
}
