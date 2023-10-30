import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CommonService } from './service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as cacheKeys from '@/constants/cache-key';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    allowedHeaders: [],
    credentials: true,
  },
})
@WebSocketGateway()
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly commonService: CommonService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @WebSocketServer() server: Server;

  async handleDisconnect(/*client: any*/) {
    const value = await this.cacheManager.get(cacheKeys.TOTAL_MEMBER_ONLINE);

    if (typeof value === 'number') {
      await this.cacheManager.set(cacheKeys.TOTAL_MEMBER_ONLINE, value + 1, 0);
    } else {
      await this.cacheManager.set(cacheKeys.TOTAL_MEMBER_ONLINE, 0, 0);
    }
    // console.log('client disconnect: ', client.id);
  }

  async handleConnection(/*client: any*/) {
    const value = await this.cacheManager.get(cacheKeys.TOTAL_MEMBER_ONLINE);

    if (typeof value === 'number') {
      await this.cacheManager.set(cacheKeys.TOTAL_MEMBER_ONLINE, value - 1, 0);
    } else {
      await this.cacheManager.set(cacheKeys.TOTAL_MEMBER_ONLINE, 0, 0);
    }
    // console.log('client connect: ', client.id);
    // this.commonService.increaseRequestCount();
  }

  afterInit(/*server: any*/) {
    console.log('wsc running');
  }

  // @SubscribeMessage('test')
  // async handleEventJoinByUser() {
  //   const socketData = await this.socketService.connect(data);
  //   console.log('===================================', data);
  //   this.emitOnline(socketData);
  // }
}
