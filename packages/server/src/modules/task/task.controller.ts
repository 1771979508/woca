import { Body, Controller, Get, Param, Post, Query, UseGuards, Request } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../infra/guards/jwt-auth.guard'
import { TaskService } from './task.service'

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post()
  create(
    @Request() req: any,
    @Body() body: { videoUrl: string; fileName: string; x1?: number; y1?: number; x2?: number; y2?: number },
  ) {
    return this.taskService.create(req.user.id, body)
  }

  @Get()
  findAll(@Request() req: any, @Query('page') page = 1, @Query('pageSize') pageSize = 10) {
    return this.taskService.findAll(req.user.id, +page, +pageSize)
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.taskService.findOne(+id, req.user.id)
  }

  @Get(':id/download')
  getDownload(@Request() req: any, @Param('id') id: string) {
    return this.taskService.getDownloadUrl(+id, req.user.id)
  }
}
