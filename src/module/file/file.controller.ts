import {
  Controller,
  Get,
  Param,
  Post,
  Response,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { FileService } from './file.service';

@ApiTags('files')
@Controller({
  path: 'files',
  version: '1',
})
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get()
  all() {
    return this.fileService.findAll();
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  // @UseGuards(AuthGuard('jwt-access'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: (req, file, next) => {
          next(null, 'uploads');
        },
        filename: (req, file, next) => {
          next(
            null,
            new Date().toISOString().replace(/:/g, '-') +
              '-' +
              file.originalname,
          );
        },
      }),
      fileFilter: (req, file, cb) => {
        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile('files') files: Express.Multer.File) {
    return this.fileService.saveFile(files);
  }

  @Get(':path')
  @ApiParam({
    name: 'path',
    type: 'string',
  })
  download(@Param('path') path, @Response() response) {
    return response.sendFile(path, { root: './files' });
  }
}
