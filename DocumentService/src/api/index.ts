import express, { Request, Response, NextFunction } from "express";
import winston from "winston";

import { CoreInterface, APIInterface } from "../types.js";
import * as v1_0 from "./v1_0/index.js";

export class API implements APIInterface {
  private log: winston.Logger;
  private _app: express.Application;
  constructor(_Core: CoreInterface) {
    this.log = _Core.logger as winston.Logger;
    v1_0.init(_Core);
    this._app = express();

    // ************* Health check API ************************
    this._app.use(
      "/documentService/api/v1.0/health",
      (req: Request, res: Response) => {
        return res.status(200).json({ data: { alive: true } });
      }
    );

    // ************* Setting up routes ***********************
    this._app.use("/documentService/api/v1.0/", v1_0.router);

    // ******* Setting up 404 Not found error ****************
    this._app.use((_req: Request, res: Response) => {
      return res
        .status(404)
        .json({ error: { message: "Requested URL not found!" } });
    });

    // ******* Setting up 500 Internal server error **********
    this._app.use(
      (error: any, _req: Request, res: Response, next: NextFunction) => {
        this.log.error({ err: error, message: "API error!" });
        return res
          .status(error.status || 500)
          .json({ error: { message: error.message } });
      }
    );
  }
  public get app() {
    return this._app;
  }
}
