import { Application } from "express";
import winston from "winston";
import {
  GetObjectCommandOutput,
  PutObjectCommandOutput,
} from "@aws-sdk/client-s3";

import { DocumentOperations } from "./storage/index.js";
import { Document } from "./storage/entities/index.js";
import { MessageBroker } from "./controller/utils/MessageBroker.js";

export interface CoreInterface {
  redis?: any;
  logger?: winston.Logger;
  aws?: AWSUtilInterface;
  mb?: MessageBroker;
  store?: StorageInterface;
}

export interface APIInterface {
  get app(): Application;
}

export interface StorageInterface {
  document: DocumentOperations<Document>;
}

export interface AWSUtilInterface {
  putObject(
    bucketName: string,
    key: string,
    body: any,
    contentType?: string
  ): Promise<PutObjectCommandOutput>;
  getObject(bucketName: string, key: string): Promise<GetObjectCommandOutput>;
}

export interface DocumentControllerInterface {
  create(documentData: Partial<Document>): Promise<string>;
  update(documentData: Partial<Document>): Promise<string>;
  findMetaByID(documentID: string): Promise<Document>;
  findByID(documentID: string): Promise<{ document: Document; body: any }>;
}
