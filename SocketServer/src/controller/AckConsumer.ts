import { Job } from "bullmq";

import { MessageBroker } from "./utils/MessageBroker.js";
import {
  AckConsumerInterface,
  ControllersInterface,
  CoreInterface,
} from "../types.js";

export class AckConsumer implements AckConsumerInterface {
  private mb: MessageBroker;
  private controller: ControllersInterface;

  constructor(Core: CoreInterface) {
    this.mb = new MessageBroker(Core);
    this.controller = Core.controllers as ControllersInterface;

    this.mb.createWorker(
      "edit-acks",
      async (job: Job) => {
        const ackPayload = job.data;
        await this.controller.documentController.handleAck(ackPayload);
      },
      {
        concurrency: 10,
      }
    );
  }

  async stop(): Promise<void> {
    await this.mb.close();
  }
}
