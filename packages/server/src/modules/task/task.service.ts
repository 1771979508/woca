import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { Task, TaskStatus } from './task.entity'

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private repo: Repository<Task>,
    @InjectQueue('task') private taskQueue: Queue,
  ) {}

  async create(userId: number, data: { videoUrl: string; fileName: string; x1?: number; y1?: number; x2?: number; y2?: number }) {
    const task = this.repo.create({ userId, ...data, status: TaskStatus.PENDING })
    const saved = await this.repo.save(task)
    await this.taskQueue.add('process', { taskId: saved.id }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } })
    return { data: saved }
  }

  async findAll(userId: number, page = 1, pageSize = 10) {
    const [list, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })
    return { data: { list, total, page, pageSize } }
  }

  async findOne(id: number, userId: number) {
    const task = await this.repo.findOne({ where: { id } })
    if (!task) throw new NotFoundException('任务不存在')
    if (task.userId !== userId) throw new ForbiddenException()
    return { data: task }
  }

  async getDownloadUrl(id: number, userId: number) {
    const task = await this.repo.findOne({ where: { id } })
    if (!task) throw new NotFoundException('任务不存在')
    if (task.userId !== userId) throw new ForbiddenException()
    if (task.status !== TaskStatus.DONE || !task.resultUrl) throw new ForbiddenException('任务尚未完成')
    return { data: { url: task.resultUrl } }
  }

  updateStatus(id: number, status: TaskStatus, extra?: Partial<Task>) {
    return this.repo.update(id, { status, ...extra })
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } })
  }
}
