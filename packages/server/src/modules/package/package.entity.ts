import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../infra/entities/base.entity'

@Entity('packages')
export class Package extends BaseEntity {
  @Column()
  name: string

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number

  @Column({ type: 'int' })
  seconds: number

  @Column({ name: 'is_popular', default: false })
  isPopular: boolean

  @Column({ name: 'is_active', default: true })
  isActive: boolean

  @Column({ nullable: true })
  description: string
}
