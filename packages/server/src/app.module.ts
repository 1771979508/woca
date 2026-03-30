import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BullModule } from '@nestjs/bull'
import { ScheduleModule } from '@nestjs/schedule'
import { AuthModule } from './modules/auth/auth.module'
import { TaskModule } from './modules/task/task.module'
import { PackageModule } from './modules/package/package.module'
import { OrderModule } from './modules/order/order.module'
import { UserModule } from './modules/user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get('DB_USER', 'root'),
        password: config.get('DB_PASS', ''),
        database: config.get('DB_NAME', ''),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get('NODE_ENV') !== 'production',
        charset: 'utf8mb4',
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get('REDIS_PASS', ''),
        },
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    TaskModule,
    PackageModule,
    OrderModule,
  ],
})
export class AppModule {}
