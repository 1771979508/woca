import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { UserService } from '../user/user.service'

@Injectable()
export class AuthService {
  private scenes = new Map<string, { status: string; openid?: string }>()

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async getWxQrCode() {
    const accessToken = await this.getAccessToken()
    const sceneId = `login_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const res = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${accessToken}`,
      { expire_seconds: 300, action_name: 'QR_STR_SCENE', action_info: { scene: { scene_str: sceneId } } },
    )
    this.scenes.set(sceneId, { status: 'waiting' })
    return { data: { sceneId, qrUrl: `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${res.data.ticket}` } }
  }

  async pollWxLogin(sceneId: string) {
    const scene = this.scenes.get(sceneId)
    if (!scene || scene.status === 'waiting') return { data: null }
    if (scene.openid) {
      this.scenes.delete(sceneId)
      const result = await this.loginByOpenid(scene.openid)
      return { data: result }
    }
    return { data: null }
  }

  async handleWxEvent(openid: string, sceneStr: string) {
    if (this.scenes.has(sceneStr)) {
      this.scenes.set(sceneStr, { status: 'scanned', openid })
    }
  }

  async miniAppLogin(code: string) {
    const appId = this.config.get('WX_MINIAPP_APPID')
    const secret = this.config.get('WX_MINIAPP_SECRET')
    const res = await axios.get(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${code}&grant_type=authorization_code`,
    )
    if (res.data.errcode) throw new UnauthorizedException('微信登录失败')
    const result = await this.loginByOpenid(res.data.openid, res.data.unionid)
    return { data: result }
  }

  private async loginByOpenid(openid: string, unionid?: string) {
    const user = await this.userService.upsertByOpenid(openid, { unionid })
    const token = this.jwtService.sign({ sub: user.id, openid: user.openid })
    return { token, userInfo: { id: user.id, nickname: user.nickname, avatar: user.avatar, remainSeconds: user.remainSeconds } }
  }

  private async getAccessToken() {
    const appId = this.config.get('WX_MP_APPID')
    const secret = this.config.get('WX_MP_SECRET')
    const res = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${secret}`,
    )
    return res.data.access_token
  }
}
