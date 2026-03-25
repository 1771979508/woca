import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id } })
  }

  findByOpenid(openid: string) {
    return this.repo.findOne({ where: { openid } })
  }

  async upsertByOpenid(openid: string, data: Partial<User>) {
    let user = await this.findByOpenid(openid)
    if (!user) {
      user = this.repo.create({ openid, ...data })
    } else {
      Object.assign(user, data)
    }
    return this.repo.save(user)
  }

  async deductSeconds(userId: number, seconds: number) {
    await this.repo.decrement({ id: userId }, 'remainSeconds', seconds)
  }

  async addSeconds(userId: number, seconds: number) {
    await this.repo.increment({ id: userId }, 'remainSeconds', seconds)
  }
}
