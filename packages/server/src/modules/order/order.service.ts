import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { Order, OrderStatus, PayChannel } from './order.entity'
import { PackageService } from '../package/package.service'
import { UserService } from '../user/user.service'

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private repo: Repository<Order>,
    private packageService: PackageService,
    private userService: UserService,
    private config: ConfigService,
  ) {}

  async create(userId: number, packageId: number) {
    const pkg = await this.packageService.findById(packageId)
    if (!pkg) throw new NotFoundException('套餐不存在')
    const outTradeNo = `WOCA${Date.now()}${userId}`
    const order = this.repo.create({ userId, packageId, amount: pkg.price, outTradeNo, status: OrderStatus.PENDING })
    const saved = await this.repo.save(order)
    return { data: { orderId: saved.id, outTradeNo, amount: pkg.price } }
  }

  async getStatus(id: number, userId: number) {
    const order = await this.repo.findOne({ where: { id, userId } })
    if (!order) throw new NotFoundException('订单不存在')
    return { data: order }
  }

  async getWechatQrCode(orderId: number, userId: number) {
    const { data: order } = await this.getStatus(orderId, userId)
    if (order.status === OrderStatus.PAID) throw new BadRequestException('订单已支付')
    const res = await axios.post(
      'https://api.mch.weixin.qq.com/v3/pay/transactions/native',
      {
        appid: this.config.get('WX_MP_APPID'),
        mchid: this.config.get('WX_PAY_MCH_ID'),
        description: `Woca套餐-${order.id}`,
        out_trade_no: order.outTradeNo,
        notify_url: `${this.config.get('SERVER_URL')}/api/orders/notify/wechat`,
        amount: { total: Math.round(Number(order.amount) * 100), currency: 'CNY' },
      },
      { headers: { Authorization: `WECHATPAY2-SHA256-RSA2048 ${this.config.get('WX_PAY_API_KEY')}` } },
    )
    return { data: { qrUrl: res.data.code_url } }
  }

  async getAlipayQrCode(orderId: number, userId: number) {
    const { data: order } = await this.getStatus(orderId, userId)
    if (order.status === OrderStatus.PAID) throw new BadRequestException('订单已支付')
    const res = await axios.post('https://openapi.alipay.com/gateway.do', {
      method: 'alipay.trade.precreate',
      out_trade_no: order.outTradeNo,
      total_amount: order.amount,
      subject: `Woca套餐-${order.id}`,
      notify_url: `${this.config.get('SERVER_URL')}/api/orders/notify/alipay`,
    })
    return { data: { qrUrl: res.data.alipay_trade_precreate_response?.qr_code } }
  }

  async getMiniAppPrepay(orderId: number, userId: number, openid: string) {
    const { data: order } = await this.getStatus(orderId, userId)
    const res = await axios.post('https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi', {
      appid: this.config.get('WX_MINIAPP_APPID'),
      mchid: this.config.get('WX_PAY_MCH_ID'),
      description: `Woca套餐-${order.id}`,
      out_trade_no: order.outTradeNo,
      notify_url: `${this.config.get('SERVER_URL')}/api/orders/notify/wechat`,
      amount: { total: Math.round(Number(order.amount) * 100), currency: 'CNY' },
      payer: { openid },
    })
    return { data: { prepayId: res.data } }
  }

  async handleWechatNotify(body: any) {
    const outTradeNo = body?.resource?.ciphertext
    if (!outTradeNo) return 'ok'
    const order = await this.repo.findOne({ where: { outTradeNo } })
    if (order && order.status === OrderStatus.PENDING) {
      order.status = OrderStatus.PAID
      order.payChannel = PayChannel.WECHAT
      order.paidAt = new Date()
      await this.repo.save(order)
      const pkg = await this.packageService.findById(order.packageId)
      if (pkg) await this.userService.addSeconds(order.userId, pkg.seconds)
    }
    return 'ok'
  }

  async handleAlipayNotify(body: any) {
    const outTradeNo = body?.out_trade_no
    if (!outTradeNo) return 'ok'
    const order = await this.repo.findOne({ where: { outTradeNo } })
    if (order && order.status === OrderStatus.PENDING && body.trade_status === 'TRADE_SUCCESS') {
      order.status = OrderStatus.PAID
      order.payChannel = PayChannel.ALIPAY
      order.payTradeNo = body.trade_no
      order.paidAt = new Date()
      await this.repo.save(order)
      const pkg = await this.packageService.findById(order.packageId)
      if (pkg) await this.userService.addSeconds(order.userId, pkg.seconds)
    }
    return 'ok'
  }
}
