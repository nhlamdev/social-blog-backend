import { checkIsNumber } from '@/utils/global-func';
import { Injectable } from '@nestjs/common';
import * as Redis from 'redis';

@Injectable()
export class RedisService {
  private client: Redis.RedisClientType;

  constructor() {
    // Create a Redis client and configure it
    this.client = Redis.createClient({
      url: `redis://${process.env.HOST}:${process.env.REDIS_PORT}`,
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }

  async getStringOrNull(key: string): Promise<string | null> {
    return await this.client.GET(key);
  }

  async getNumberOrNull(key: string): Promise<number | null> {
    const value = await this.client.GET(key);
    if (checkIsNumber(value)) {
      return Number(value);
    } else {
      return null;
    }
  }

  // async set
}
