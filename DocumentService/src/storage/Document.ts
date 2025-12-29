import winston from "winston";
import { DataSource, Repository } from "typeorm";
import { validate } from "class-validator";

import { CoreInterface } from "../types.js";
import { CommonEntity, Document } from "./entities/index.js";

export class DocumentOperations<Entity extends CommonEntity> {
  private log: winston.Logger;
  private documentRepository: Repository<Document>;
  constructor(Core: CoreInterface, AppDataSource: DataSource) {
    this.log = Core.logger as winston.Logger;
    this.documentRepository = AppDataSource.getRepository(Document);
  }

  private async save(
    elementRepo: Repository<Document>,
    element: Document
  ): Promise<string> {
    const errors = await validate(element);
    if (errors.length === 0) {
      const saveRes = await elementRepo.save(element);
      return saveRes.id;
    } else {
      const err = new Error(errors.toString());
      throw err;
    }
  }

  async create(documentData: Partial<Document>): Promise<string> {
    try {
      const document = this.documentRepository.create(documentData);
      const documentID = await this.save(this.documentRepository, document);
      return documentID;
    } catch (err: any) {
      this.log.error(`DocumentOperations :: create : ${err.message}`);
      throw err;
    }
  }

  async update(documentData: Partial<Document>): Promise<string> {
    try {
      this.save(this.documentRepository, documentData as Document);
      return "Document updated successfully!";
    } catch (err: any) {
      this.log.error(`DocumentOperations :: update : ${err.message}`);
      throw err;
    }
  }

  async findByID(documentID: string): Promise<Document> {
    try {
      const document = await this.documentRepository.findOne({
        where: { id: documentID },
      });
      if (!document)
        throw new Error(`No document found with id: ${documentID}`);
      return document;
    } catch (err: any) {
      this.log.error(`DocumentOperations :: findByID : ${err.message}`);
      throw err;
    }
  }
}
