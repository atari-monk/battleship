import { GatewayModule } from '@battleship/shared-nest';
import { Module } from '@nestjs/common';

@Module({
  imports: [GatewayModule],
})
export class AppModule {}
