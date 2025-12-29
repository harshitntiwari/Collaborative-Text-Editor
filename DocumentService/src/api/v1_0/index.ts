import * as express from "express";

import { CoreInterface } from "../../types.js";
import * as document from "./document.js";

const router = express.Router();

function init(_Core: CoreInterface) {
  document.init(_Core);
  router.use("/document", document.router);
}

export { init, router };
