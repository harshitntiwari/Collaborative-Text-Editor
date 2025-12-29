import winston from "winston";
import { Job } from "bullmq";
import Delta from "quill-delta";

import {
  AWSUtilInterface,
  CoreInterface,
  DocumentControllerInterface,
  StorageInterface,
} from "../types.js";
import { Document } from "../storage/entities/index.js";
import { MessageBroker } from "./utils/MessageBroker.js";

export class DocumentController implements DocumentControllerInterface {
  private log: winston.Logger;
  private storage: StorageInterface;
  private aws: AWSUtilInterface;
  private bucketName: string;
  private mb: MessageBroker;

  constructor(_Core: CoreInterface) {
    this.log = _Core.logger as winston.Logger;
    this.storage = _Core.store as StorageInterface;
    this.aws = _Core.aws as AWSUtilInterface;
    this.bucketName = "collab-text";
    this.mb = _Core.mb as MessageBroker;

    this.mb.createWorker(
      "edits",
      async (job: Job) => {
        const editPayload = job.data;
        await this.handleEdits(editPayload);
      },
      {
        concurrency: 10,
      }
    );
  }

  async create(documentData: Partial<Document>): Promise<string> {
    try {
      const documentID = await this.storage.document.create(documentData);
      documentData.s3Key = `documents/${documentID}`;
      const documentContent = { ops: [] };
      await this.aws.putObject(
        this.bucketName,
        documentData.s3Key,
        JSON.stringify(documentContent),
        "application/json"
      );
      await this.update(documentData);
      return documentID;
    } catch (err: any) {
      this.log.error(`DocumentController :: create : ${err.message}`);
      throw err;
    }
  }

  async update(documentData: Partial<Document>): Promise<string> {
    try {
      const documentExists = await this.findMetaByID(documentData.id as string);
      if (!documentExists)
        throw new Error(`No document found with id: ${documentData.id}`);
      const updateRes = await this.storage.document.update(documentData);
      return updateRes;
    } catch (err: any) {
      this.log.error(`DocumentController :: update : ${err.message}`);
      throw err;
    }
  }

  async findMetaByID(documentID: string): Promise<Document> {
    try {
      const document = await this.storage.document.findByID(documentID);
      return document;
    } catch (err: any) {
      this.log.error(`DocumentController :: findMetaByID : ${err.message}`);
      throw err;
    }
  }

  async findByID(
    documentID: string
  ): Promise<{ document: Document; body: any }> {
    try {
      const document = await this.findMetaByID(documentID);
      const s3Key = document.s3Key || `documents/${documentID}`;
      const doc = await this.aws.getObject(this.bucketName, s3Key);
      return { document: document, body: doc.Body };
    } catch (err: any) {
      this.log.error(`DocumentController :: findByID : ${err.message}`);
      throw err;
    }
  }

  private async handleEdits(editPayload: any) {
    try {
      const documentID: string = editPayload.documentID;
      const { document, body } = await this.findByID(documentID);
      const recievedDelta = editPayload.delta;
      const currentDelta = new Delta(JSON.parse(body));

      const updatedDelta = currentDelta.compose(recievedDelta);

      await this.aws.putObject(
        this.bucketName,
        document.s3Key as string,
        JSON.stringify(updatedDelta),
        "application/json"
      );
      await this.update({ id: documentID, updatedAt: new Date() });

      await this.mb.pushJob("edit-acks", "ack", {
        editID: editPayload.editID,
        documentID: editPayload.documentID,
        version: editPayload.version,
      });
    } catch (err: any) {
      this.log.error(`DocumentController :: handleEdits : ${err.message}`);
      throw err;
    }
  }
}
