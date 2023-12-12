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
