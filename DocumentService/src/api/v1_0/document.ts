import { Request, Response, Router } from "express";
import { CoreInterface, DocumentControllerInterface } from "../../types.js";
import { DocumentController } from "../../controller/index.js";

const router = Router();

let documentController: DocumentControllerInterface;

function init(_Core: CoreInterface) {
  documentController = new DocumentController(_Core);
}

router.post("/", [], async (req: Request, res: Response) => {
  try {
    const documentData = {
      title: "Untitled document",
      version: 0,
      mimeType: "application/json",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createRes = await documentController.create(documentData);
    return res.status(200).json(createRes);
  } catch (err) {
    return res
      .status((err as any)?.err?.statusCode || 422)
      .json({ error: { msg: err } });
  }
});

router.put("/:id", [], async (req: Request, res: Response) => {
  try {
    const documentData = {
      id: req.params?.id,
      title: req.body?.title,
    };

    const findRes = await documentController.update(documentData);
    return res.status(200).json(findRes);
  } catch (err: any) {
    return res
      .status(err?.err?.statusCode || 422)
      .json({ error: { msg: err } });
  }
});

router.get("/:id", [], async (req: Request, res: Response) => {
  try {
    const documentID = req.params?.id;

    const findRes = await documentController.findByID(documentID);
    return res.status(200).json(findRes);
  } catch (err: any) {
    return res
      .status(err?.err?.statusCode || 422)
      .json({ error: { msg: err } });
  }
});

export { init, router };
