import { CoreInterface } from "../types.js";
import * as utils from "./utils/index.js";
import * as storage from "../storage/index.js";
import { DocumentController } from "./Document.js";

const Core: CoreInterface = {};
async function init() {
  try {
    await utils.init(Core);

    await storage.init(Core);
    Core.store = storage.store;
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

async function close() {
  console.log("Controller shutdown!");
}

export { init, close, Core, DocumentController };
