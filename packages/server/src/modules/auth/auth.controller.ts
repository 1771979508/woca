import { Body, Controller, Get, Post, Query, Res, UseGuards, Request, RawBodyRequest, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'
import * as xml2js from 'xml2js'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from '../../infra/guards/jwt-auth.guard'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Get('wx/qrcode')
  getWxQrCode() {
    return this.authService.getWxQrCode()
  }

  @Get('wx/poll')
  pollWxLogin(@Query('sceneId') sceneId: string) {
    return this.authService.pollWxLogin(sceneId)
  }

  @Get('wx/callback')
  wxVerify(
    @Query('signature') signature: string,
    @Query('timestamp') timestamp: string,
    @Query('nonce') nonce: string,
    @Query('echostr') echostr: string,
    @Res() res: any,
  ) {
    const token = this.config.get('WX_MP_TOKEN', '')
    const hash = crypto
      .createHash('sha1')
      .update([token, timestamp, nonce].sort().join(''))
      .digest('hex')
    if (hash === signature) {
      res.send(echostr)
    } else {
      res.status(403).send('invalid signature')
    }
  }

  @Post('wx/callback')
  async wxCallback(@Req() req: RawBodyRequest<any>, @Res() res: any) {
    try {
      const rawBody = req.body
      const bodyStr = typeof rawBody === 'string' ? rawBody : rawBody?.toString?.() ?? ''
      const parsed = await xml2js.parseStringPromise(bodyStr, { explicitArray: false })
      const xml = parsed?.xml
      console.log('[wx callback] parsed xml:', JSON.stringify(xml))
      if (xml?.Event === 'SCAN' || xml?.Event === 'subscribe') {
        await this.authService.handleWxEvent(xml.FromUserName, xml.EventKey?.replace('qrscene_', ''))
      }
    } catch (e) {
      console.error('[wx callback] parse error:', e)
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
