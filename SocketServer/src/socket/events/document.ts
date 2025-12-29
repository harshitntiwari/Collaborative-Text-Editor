import { Socket } from "socket.io";

import { CoreInterface, DocumentControllerInterface } from "../../types.js";

let documentController: DocumentControllerInterface;

function init(Core: CoreInterface) {
  documentController = Core.controllers
    ?.documentController as DocumentControllerInterface;
}

function router(Core: CoreInterface) {
  const socket = Core.socket as Socket;
  socket.on("document:join", (documentID) => {
    try {
      socket.join(documentID);
      socket.emit("document:joined", {
        documentID,
        message: "Successfully joined document room",
      });
    } catch (err: any) {
      socket.emit("document:error", {
        message: err.message || "Failed to join document",
      });
    }
  });

  socket.on("document:edit", (payload) => {
    try {
      documentController.handleEdit(payload);
    } catch (err: any) {
      socket.emit("document:error", {
        message: err.message || "Failed to process edit",
      });
    }
  });
}

export { init, router };
