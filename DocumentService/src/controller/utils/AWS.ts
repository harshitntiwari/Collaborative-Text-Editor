import winston from "winston";
import {
  S3Client,
  GetObjectCommand,
  GetObjectCommandOutput,
  PutObjectCommand,
  PutObjectCommandOutput,
} from "@aws-sdk/client-s3";

import { AWSUtilInterface, CoreInterface } from "../../types.js";

export class AWSUtil implements AWSUtilInterface {
  private log: winston.Logger;
  private s3: S3Client;
  constructor(Core: CoreInterface) {
    this.log = Core.logger as winston.Logger;
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: "",
        secretAccessKey: "",
      },
      region: "ap-south-1",
    });
  }

  async putObject(
    bucketName: string,
    key: string,
    body: any,
    contentType?: string
  ): Promise<PutObjectCommandOutput> {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
      });

      const res = await this.s3.send(command);
      return res;
    } catch (err: any) {
      this.log.error(`AWSUtil :: putObject : ${err.message}`);
      throw err;
    }
  }

  async getObject(
    bucketName: string,
    key: string
  ): Promise<GetObjectCommandOutput> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const res = await this.s3.send(command);
      return res;
    } catch (err: any) {
      this.log.error(`AWSUtil :: getObject : ${err.message}`);
      throw err;
    }
  }
}
