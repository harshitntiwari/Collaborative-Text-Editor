import Delta from "quill-delta";
import { Server, Socket } from "socket.io";
import winston from "winston";

export interface CoreInterface {
  io?: Server;
  socket?: Socket;
  redis?: any;
  logger?: winston.Logger;
  controllers?: ControllersInterface;
}

export interface ControllersInterface {
  documentController: DocumentControllerInterface;
  ackConsumer: AckConsumerInterface;
}

export interface DocumentControllerInterface {
  handleEdit(payload: Record<string, any>): Promise<void>;
  handleAck(ackpayload: AckPayloadInterface): Promise<void>;
}

export interface AckConsumerInterface {}

export interface DocumentState {
  deltas: Delta[];
  currentVersion: number;
}

export interface EditPayload {
  editID: string;
  documentID: string;
  delta: typeof Delta;
  version: number;
}

export interface AckPayloadInterface {
  editID: string;
  documentID: string;
  delta: typeof Delta;
  version: number;
}
