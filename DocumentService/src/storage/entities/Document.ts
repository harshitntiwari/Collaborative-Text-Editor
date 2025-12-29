import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  VersionColumn,
} from "typeorm";

import { CommonEntity } from "./CommonEntity.js";

@Entity()
export class Document extends CommonEntity {
  @Column({ nullable: false })
  title!: string;

  @Column({ nullable: false, unique: true })
  s3Key?: string;

  @Column({ nullable: true, type: "bigint" })
  contentSize?: number;

  @Column({
    nullable: true,
    type: "varchar",
    length: 100,
    default: "text/plain",
  })
  mimeType?: string;

  @CreateDateColumn({ update: false })
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @VersionColumn()
  version!: number;
}
