import { Process, Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'
import axios from 'axios'
import { ConfigService } from '@nestjs/config'
import { TaskService } from './task.service'
import { TaskStatus } from './task.entity'
import { UserService } from '../user/user.service'

const THIRD_API = 'https://env-00jxh2cj3gfd.dev-hz.cloudbasefunction.cn/http/router/user/pub'

@Processor('task')
export class TaskProcessor {
  private readonly logger = new Logger(TaskProcessor.name)

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private config: ConfigService,
  ) {}

  @Process('process')
  async handleProcess(job: Job<{ taskId: number }>) {
    const { taskId } = job.data
    const task = await this.taskService.findById(taskId)
    if (!task) return

    const secretId = this.config.get('SUBTITLE_SECRET_ID')
    const secretKey = this.config.get('SUBTITLE_SECRET_KEY')

    await this.taskService.updateStatus(taskId, TaskStatus.PROCESSING)

    try {
      const uploadRes = await axios.post(`${THIRD_API}/cacaLinkPull`, {
        secret_id: secretId,
        secret_key: secretKey,
        video_link: task.videoUrl,
        x1: task.x1,
        y1: task.y1,
        x2: task.x2,
        y2: task.y2,
      })

      if (uploadRes.data.code !== 0 || !uploadRes.data.isOk) {
        throw new Error(uploadRes.data.msg || '上传失败')
      }

      const fileId = uploadRes.data.FileId
      await this.taskService.updateStatus(taskId, TaskStatus.PROCESSING, { fileId })

      const result = await this.pollResult(secretId, secretKey, fileId, 360)

      await this.taskService.updateStatus(taskId, TaskStatus.DONE, {
        resultUrl: result.media,
        duration: result.duration,
        width: result.width,
        height: result.height,
      })

      await this.userService.deductSeconds(task.userId, Math.ceil(result.duration ?? 0))
      this.logger.log(`Task ${taskId} done, fileId: ${fileId}`)
    } catch (err: any) {
      this.logger.error(`Task ${taskId} failed: ${err.message}`)
      await this.taskService.updateStatus(taskId, TaskStatus.FAILED, { errorMsg: err.message })
      throw err
    }
  }

  private async pollResult(secretId: string, secretKey: string, fileId: string, maxRetries: number) {
    for (let i = 0; i < maxRetries; i++) {
      await new Promise((r) => setTimeout(r, 5000))
      const res = await axios.post(`${THIRD_API}/kamiSelectVideo`, {
        secret_id: secretId,
        secret_key: secretKey,
        originalFileId: fileId,
      })
      if (res.data.code === 0 && res.data.isOk === 1 && res.data.media) {
        return res.data
      }
    }
    throw new Error('视频处理超时')
  }
}
