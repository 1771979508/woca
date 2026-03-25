import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../infra/guards/jwt-auth.guard'
import { PackageService } from './package.service'

@ApiTags('packages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('packages')
export class PackageController {
  constructor(private packageService: PackageService) {}

  @Get()
  findAll() {
    return this.packageService.findAll()
  }
}
