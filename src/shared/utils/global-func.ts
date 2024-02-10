import { BadRequestException, ParseUUIDPipe } from '@nestjs/common';
import * as fs from 'fs';
import { basename, extname } from 'path';

export const getDirPathUpload = (TableName: string) => {
  const dirPath = 'uploads/' + TableName + getDatePath();
  try {
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    return dirPath;
  } catch (error) {
    console.log(error.message);
  }
};

export function deleteFolderRecursive(path: string) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      const curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

export function changeFileExtension(
  filename: string,
  newExtension: string,
): string {
  const baseName = basename(filename, extname(filename));
  return `${baseName}.${newExtension}`;
}

export function removeAscent(str: any) {
  if (str === null || str === undefined) return str;
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/\s+/g, '');
  return str;
}

export const parseUUIDCustom = new ParseUUIDPipe({
  exceptionFactory: () =>
    new BadRequestException({
      message: 'ID không hợp lệ',
    }),
});

export const detectDevice = (userAgent) => {
  let os: { name: string; version: string } | null = null;
  let browser: { name: string; version: string } | null = null;
  let device: string | null = null;

  const osRegex =
    /(windows nt|mac os x|linux|ubuntu|iphone|ipad|android) ?([\d._]*)/i;
  const osMatch = userAgent.match(osRegex);

  if (osMatch) {
    const osName = osMatch[1];
    const osVersion = osMatch[2].replace(/_/g, '.');
    os = { name: osName, version: osVersion };
  }

  const browserRegex = /(chrome|firefox|safari|opera|edge|msie)\/([\d\.]+)/i;
  const match = userAgent.match(browserRegex);

  if (match) {
    const browserName = match[1];
    const browserVersion = match[2];

    browser = { name: browserName, version: browserVersion };
  }
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|Mobile|Tablet/i;
  const isMobile = mobileRegex.test(userAgent);

  if (isMobile) {
    device = 'mobile';
  } else {
    device = 'desktop';
  }

  return { os, browser, device };
};

export const getDirPath = (dirPath: any) => {
  try {
    if (!fs.existsSync(dirPath))
      fs.promises.mkdir(dirPath, { recursive: true });
    return dirPath;
  } catch (error) {
    console.log(error.message);
  }
};

export const getDatePath = () => {
  const toDate = new Date();
  return (
    toDate.getFullYear() + '' + (toDate.getMonth() + 1) + '' + toDate.getDate()
  );
};

export function getTopKeys(
  obj: { [key: string]: number },
  top: number,
): string[] {
  const entries = Object.entries(obj);
  entries.sort((a, b) => b[1] - a[1]);
  const tops = entries.slice(0, top);
  const topKeys = tops.map((v) => v[0]);

  const result: any = {};

  for (let index = 0; index < topKeys.length; index++) {
    const key = topKeys[index];

    result[key] = obj[key];
  }

  return result;
}

export const detectIp = (ipAddress: string) => {
  const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

  if (ipAddress && ipRegex.test(ipAddress)) {
    return ipAddress;
  } else {
    return null;
  }
};

export const checkIsNumber = (value: string | undefined) => {
  return value &&
    !Number.isNaN(Number(value)) &&
    Number.isInteger(Number(value))
    ? Number(value)
    : undefined;
};
