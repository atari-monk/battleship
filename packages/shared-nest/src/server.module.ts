import { Module } from '@nestjs/common';
import { GatewayGateway } from './server.gateway';

@Module({
  providers: [GatewayGateway],
})
export class GatewayModule {}
