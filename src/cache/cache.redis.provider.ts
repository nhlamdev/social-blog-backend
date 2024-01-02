import { RedisClientType, createClient } from 'redis';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const redisProvider: Provider = {
  provide: 'REDIS_CLIENT', // Use a unique token to identify the Redis client
  useFactory: (configService: ConfigService): RedisClientType => {
    const host = configService.get('redis.host');
    const port = configService.get('redis.port');
    const account = configService.get('redis.account');
    const password = configService.get('redis.password');
    return createClient({
      url: `redis://${account}:${password}@${host}:${port}`,
    });
  },
};
