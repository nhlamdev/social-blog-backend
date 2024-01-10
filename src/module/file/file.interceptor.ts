import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map(async (file) => {
        if (file) {
          const uniqueFilename = uuidv4();
          const filename = `${uniqueFilename}-${file.originalname}`;
          const filePath = `uploads/${filename}`;

          // Tính toán tỷ lệ aspect ratio mới
          const aspectRatio = file.width / file.height;
          const newWidth = 800; // Kích thước mới
          const newHeight = Math.round(newWidth / aspectRatio);

          await sharp(file.buffer)
            .resize(newWidth, newHeight, {
              fit: sharp.fit.inside,
              withoutEnlargement: true, // Thay đổi kích thước ảnh dựa trên tỷ lệ mới mà không làm phình to ảnh nếu ảnh gốc nhỏ hơn kích thước mới
            })
            .toFile(filePath);

          req.imagePath = filePath; // Lưu đường dẫn ảnh sau khi tối ưu vào request để sử dụng sau này
        }
        return file;
      }),
    );
  }
}

export const ImageInterceptorProvider = {
  provide: 'IMAGE_INTERCEPTOR',
  useClass: ImageInterceptor,
};
