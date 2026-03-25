import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Order } from './order.entity'
import { OrderService } from './order.service'
import { OrderController } from './order.controller'
import { PackageModule } from '../package/package.module'
import { UserModule } from '../user/user.module'

@Module({
  imports: [TypeOrmModule.forFeature([Order]), PackageModule, UserModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
