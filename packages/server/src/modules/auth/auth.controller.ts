import { Body, Controller, Get, Post, Query, Res, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from '../../infra/guards/jwt-auth.guard'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('wx/qrcode')
  getWxQrCode() {
    return this.authService.getWxQrCode()
  }

  @Get('wx/poll')
  pollWxLogin(@Query('sceneId') sceneId: string) {
    return this.authService.pollWxLogin(sceneId)
  }

  @Post('wx/callback')
  async wxCallback(@Body() body: any, @Res() res: any) {
    if (body?.xml?.Event === 'SCAN' || body?.xml?.Event === 'subscribe') {
      await this.authService.handleWxEvent(body.xml.FromUserName, body.xml.EventKey?.replace('qrscene_', ''))
    }
    res.send('success')
  }

  @Post('wx/miniapp')
  miniAppLogin(@Body('code') code: string) {
    return this.authService.miniAppLogin(code)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: any) {
    const u = req.user
    return { data: { id: u.id, nickname: u.nickname, avatar: u.avatar, remainSeconds: u.remainSeconds } }
  }
}
