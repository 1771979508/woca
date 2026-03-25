import { Body, Controller, Get, Param, Post, Query, UseGuards, Request } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../infra/guards/jwt-auth.guard'
import { OrderService } from './order.service'

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body('packageId') packageId: number) {
    return this.orderService.create(req.user.id, packageId)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getStatus(@Request() req: any, @Param('id') id: string) {
    return this.orderService.getStatus(+id, req.user.id)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/qrcode')
  getQrCode(
    @Request() req: any,
    @Param('id') id: string,
    @Query('channel') channel: 'wechat' | 'alipay',
  ) {
    if (channel === 'alipay') return this.orderService.getAlipayQrCode(+id, req.user.id)
    return this.orderService.getWechatQrCode(+id, req.user.id)
  }

  @Post('notify/wechat')
  wechatNotify(@Body() body: any) {
    return this.orderService.handleWechatNotify(body)
  }

  @Post('notify/alipay')
  alipayNotify(@Body() body: any) {
    return this.orderService.handleAlipayNotify(body)
  }
}
