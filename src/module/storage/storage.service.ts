import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as minio from 'minio';
import { Readable } from 'stream';
import { Repository } from 'typeorm';
import { StorageEntity } from './storage.entity';

@Injectable()
export class StorageService {
  readonly minioClient = new minio.Client({
    endPoint: process.env.MINIO_ENDPOINT as string,
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY as string,
    secretKey: process.env.MINIO_SECRET_KEY as string,
  });

  constructor(
    @InjectRepository(StorageEntity)
    public readonly repository: Repository<StorageEntity>,
  ) {}

  async putObjectPromise(
    bucketName: string,
    objectName: string,
    stream: string | Buffer | Readable,
    size: number,
  ) {
    return new Promise<void>((resolve, reject) => {
      this.minioClient.putObject(
        bucketName,
        objectName,
        stream,
        size,
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  }

  async buckets() {}

  async getFromMinio() {}
}
