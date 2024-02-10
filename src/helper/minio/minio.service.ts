import { Injectable } from '@nestjs/common';
import * as minio from 'minio';
import { Readable } from 'stream';

@Injectable()
export class MinioService {
  private readonly client = new minio.Client({
    endPoint: process.env.MINIO_ENDPOINT as string,
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY as string,
    secretKey: process.env.MINIO_SECRET_KEY as string,
  });

  async putObjectPromise(
    bucketName: string,
    objectName: string,
    stream: string | Buffer | Readable,
    size: number,
  ) {
    return new Promise<void>((resolve, reject) => {
      this.client.putObject(bucketName, objectName, stream, size, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
