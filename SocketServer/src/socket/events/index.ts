import * as document from "./document.js";
import { CoreInterface } from "../../types.js";

export function init(Core: CoreInterface) {
  document.init(Core);
  document.router(Core);
}
