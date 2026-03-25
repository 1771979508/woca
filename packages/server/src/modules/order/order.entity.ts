import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../../infra/entities/base.entity'
import { User } from '../user/user.entity'
import { Package } from '../package/package.entity'

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PayChannel {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
}

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ name: 'package_id' })
  packageId: number

  @ManyToOne(() => Package)
  @JoinColumn({ name: 'package_id' })
  package: Package

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus

  @Column({ type: 'enum', enum: PayChannel, nullable: true, name: 'pay_channel' })
  payChannel: PayChannel

  @Column({ name: 'pay_trade_no', nullable: true })
  payTradeNo: string

  @Column({ name: 'prepay_id', nullable: true })
  prepayId: string

  @Column({ name: 'paid_at', nullable: true })
  paidAt: Date

  @Column({ name: 'out_trade_no', unique: true })
  outTradeNo: string
}
