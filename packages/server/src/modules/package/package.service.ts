import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Package } from './package.entity'

@Injectable()
export class PackageService {
  constructor(@InjectRepository(Package) private repo: Repository<Package>) {}

  findAll() {
    return this.repo.find({ where: { isActive: true }, order: { price: 'ASC' } })
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id, isActive: true } })
  }
}
