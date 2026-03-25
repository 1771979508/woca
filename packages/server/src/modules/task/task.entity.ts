import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../../infra/entities/base.entity'
import { User } from '../user/user.entity'

export enum TaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  DONE = 'done',
  FAILED = 'failed',
}

@Entity('tasks')
export class Task extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ name: 'file_name' })
  fileName: string

  @Column({ name: 'video_url', type: 'text' })
  videoUrl: string

  @Column({ name: 'file_id', nullable: true })
  fileId: string

  @Column({ name: 'result_url', type: 'text', nullable: true })
  resultUrl: string

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus

  @Column({ type: 'float', nullable: true })
  duration: number

  @Column({ nullable: true })
  width: number

  @Column({ nullable: true })
  height: number

  @Column({ name: 'error_msg', nullable: true })
  errorMsg: string

  @Column({ type: 'int', default: 0, name: 'x1' })
  x1: number

  @Column({ type: 'int', default: 0, name: 'y1' })
  y1: number

  @Column({ type: 'int', default: 0, name: 'x2' })
  x2: number

  @Column({ type: 'int', default: 0, name: 'y2' })
  y2: number
}
