import { ControllersInterface, CoreInterface } from "../types.js";
import { AckConsumer } from "./AckConsumer.js";
import { DocumentController } from "./Document.js";

async function init(Core: CoreInterface) {
  try {
    const documentController = new DocumentController(Core);
    const ackConsumer = new AckConsumer(Core);

    const controllers: ControllersInterface = {
      get documentController() {
        return documentController;
      },
      get ackConsumer() {
        return ackConsumer;
      },
    };

    Core.controllers = controllers;
  } catch (err) {
    throw err;
  }
}

export { init };
