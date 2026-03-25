import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../infra/entities/base.entity'

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  openid: string

  @Column({ nullable: true })
  unionid: string

  @Column({ nullable: true })
  nickname: string

  @Column({ nullable: true })
  avatar: string

  @Column({ name: 'remain_seconds', type: 'int', default: 0 })
  remainSeconds: number

  @Column({ name: 'is_active', default: true })
  isActive: boolean
}
