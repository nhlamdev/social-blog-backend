import * as multer from 'multer';
import { extname } from 'path';

export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },

  filename: (req, file, cb) => {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    return cb(null, `${randomName}${extname(file.originalname)}`);
  },
});
