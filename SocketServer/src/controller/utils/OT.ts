import Delta from "quill-delta";
import winston from "winston";

import { CoreInterface, DocumentState } from "../../types.js";

export class OT {
  private log: winston.Logger;
  private documentStates: Map<string, DocumentState> = new Map();

  constructor(Core: CoreInterface) {
    this.log = Core.logger as winston.Logger;
  }

  private getDocumentState(documentID: string): DocumentState {
    try {
      if (!this.documentStates.get(documentID)) {
        this.documentStates.set(documentID, {
          deltas: [],
          currentVersion: 0,
        });
      }
      return this.documentStates.get(documentID)!;
    } catch (err: any) {
      this.log.error(`OT :: getDocumentState : ${err.message}`);
      throw err;
    }
  }

  getCurrentVersion(documentID: string) {
    try {
      return this.documentStates.get(documentID)?.currentVersion;
    } catch (err: any) {
      this.log.error(`OT :: getCurrentVersion : ${err.message}`);
      throw err;
    }
  }

  async transformDelta(
    documentID: string,
    version: number,
    incomingDelta: any
  ): Promise<{ transformedDelta: Delta; newVersion: number }> {
    try {
      const state = this.getDocumentState(documentID) as DocumentState;

      if (version < 0 || state.currentVersion < version) {
        throw new Error(
          `Invalid version. Client version: ${version}, Server version: ${state.currentVersion}. Client may be out of sync`
        );
      }

      const concurrentDeltas = state.deltas.slice(version);

      let cumulativeDelta = new Delta(incomingDelta);
      for (let i = 0; i < concurrentDeltas.length; i++) {
        const conurrentDelta = new Delta(concurrentDeltas[i]);
        cumulativeDelta = conurrentDelta.transform(cumulativeDelta, true);
      }

      state.deltas.push(cumulativeDelta);
      state.currentVersion = state.deltas.length;

      return {
        transformedDelta: cumulativeDelta,
        newVersion: state.currentVersion,
      };
    } catch (err: any) {
      this.log.error(`OT :: transformDelta : ${err.message}`);
      throw err;
    }
  }
}
