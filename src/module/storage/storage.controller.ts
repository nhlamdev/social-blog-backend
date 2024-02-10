import { changeFileExtension } from '@/shared/utils/global-func';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { Readable } from 'stream';
import { storage } from './config';
import { UploadFileDto, UploadFilesDto } from './storage.dto';
import { StorageService } from './storage.service';

@ApiTags('storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  // @Post('upload-multiple')
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       files: {
  //         type: 'string',
  //         format: 'binary',
  //       },
  //     },
  //   },
  // })
  // @UseInterceptors(
  //   FilesInterceptor('files', 10, {
  //     storage: storage,
  //     fileFilter: (req, file, cb) => {
  //       cb(null, true);
  //     },
  //   }),
  // )
  // async uploadFiles(
  //   @Req() req,
  //   @Body() body: UploadFileDto,
  //   @UploadedFiles() files: Express.Multer.File[],
  // ) {
  //   const { cluster } = body;
  // }

  @Get('cluster')
  async cluster() {}

  @Get('take/:cluster/:name')
  async down(
    @Param('cluster') cluster: string,
    @Param('fileName') name: string,
  ) {
    // this.fileService.minioClient.getObject(
    //   bucketName,
    //   fileName,
    //   (error, dataStream) => {
    //     if (error) {
    //       console.log('Error downloading object:', error);
    //       res.status(500).send('Error downloading object from MinIO');
    //     } else {
    //       // res.setHeader('Content-Type', 'video/mp4');
    //       dataStream.pipe(res);
    //     }
    //   },
    // );
  }

  @Post('upload-single')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: storage,
    }),
  )
  async uploadFileSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadFileDto,
  ) {
    const { cluster } = body;

    const target = await fs.promises.readFile(file.path);

    let transform: {
      file: Buffer;
      name: string;
    } = {
      file: target,
      name: file.filename,
    };

    if (file.mimetype.startsWith('image')) {
      const transformedImage = await sharp(target).toFormat('jpeg').toBuffer();
      const transformedFileName = changeFileExtension(file.filename, 'jpg');

      transform = {
        file: transformedImage,
        name: transformedFileName,
      };
    }

    const fileStream = new Readable();
    fileStream.push(transform.file);
    fileStream.push(null);

    await this.storageService.putObjectPromise(
      cluster,
      transform.name,
      fileStream,
      transform.file.length,
    );

    await fs.promises.unlink(file.path);

    return `/storage/${cluster}/${transform.name}`;
  }

  @Post('upload-multiple')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: storage,
    }),
  )
  async uploadFileMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UploadFilesDto,
  ) {
    const { cluster } = body;

    const uploadPromises = files.map(async (file) => {
      const target = await fs.promises.readFile(file.path);

      let transform: {
        file: Buffer;
        name: string;
      } = {
        file: target,
        name: file.filename,
      };

      if (file.mimetype.startsWith('image')) {
        const transformedImage = await sharp(target)
          .toFormat('jpeg')
          .toBuffer();
        const transformedFileName = changeFileExtension(file.filename, 'jpg');

        transform = {
          file: transformedImage,
          name: transformedFileName,
        };
      }

      const fileStream = new Readable();
      fileStream.push(transform.file);
      fileStream.push(null);

      await this.storageService.putObjectPromise(
        cluster,
        transform.name,
        fileStream,
        transform.file.length,
      );

      await fs.promises.unlink(file.path);
      return `/storage/cluster/${file.filename}`;
    });

    return Promise.all(uploadPromises);
  }

  @Delete()
  async deleteFile() {}
}
