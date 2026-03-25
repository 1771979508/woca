import { useEffect, useState } from 'react'
import { Row, Col, Card, Button, Modal, Radio, Typography, message, Spin, Tag } from 'antd'
import { WechatOutlined, AlipayCircleOutlined } from '@ant-design/icons'
import { packageApi } from '@/api'

const { Title, Text } = Typography

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [payModal, setPayModal] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<number | null>(null)
  const [qrUrl, setQrUrl] = useState('')
  const [channel, setChannel] = useState<'wechat' | 'alipay'>('wechat')
  const [polling, setPolling] = useState(false)

  useEffect(() => { fetchPackages() }, [])

  async function fetchPackages() {
    setLoading(true)
    try {
      const res: any = await packageApi.getPackageList()
      setPackages(res.data)
    } catch {
      message.error('获取套餐列表失败')
    } finally {
      setLoading(false)
    }
  }

  async function handleBuy(pkg: any) {
    try {
      const res: any = await packageApi.createOrder(pkg.id)
      const orderId = res.data.orderId
      setCurrentOrder(orderId)
      await loadQrCode(orderId, channel)
      setPayModal(true)
      startPolling(orderId)
    } catch {
      message.error('创建订单失败')
    }
  }

  async function loadQrCode(orderId: number, ch: 'wechat' | 'alipay') {
    const res: any = await packageApi.getPayQrCode(orderId, ch)
    setQrUrl(res.data.qrUrl)
  }

  function startPolling(orderId: number) {
    setPolling(true)
    const timer = setInterval(async () => {
      try {
        const res: any = await packageApi.getOrderStatus(orderId)
        if (res.data.status === 'paid') {
          clearInterval(timer)
          setPolling(false)
          setPayModal(false)
          message.success('支付成功！套餐已到账')
        }
      } catch {
        clearInterval(timer)
        setPolling(false)
      }
    }, 2000)
  }

  return (
    <div>
      <Title level={4}>套餐购买</Title>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {packages.map((pkg) => (
            <Col key={pkg.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                style={{ textAlign: 'center', borderRadius: 12 }}
                actions={[
                  <Button type="primary" onClick={() => handleBuy(pkg)}>立即购买</Button>,
                ]}
              >
                {pkg.isPopular && <Tag color="volcano" style={{ marginBottom: 8 }}>热门</Tag>}
                <Title level={4} style={{ marginTop: 8 }}>{pkg.name}</Title>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#6366f1', margin: '8px 0' }}>
                  ¥{pkg.price}
                </div>
                <Text type="secondary">{pkg.seconds} 秒时长</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>

      <Modal
        title="扫码支付"
        open={payModal}
        onCancel={() => setPayModal(false)}
        footer={null}
        centered
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Radio.Group
            value={channel}
            onChange={(e) => {
              setChannel(e.target.value)
              if (currentOrder) loadQrCode(currentOrder, e.target.value)
            }}
            style={{ marginBottom: 24 }}
          >
            <Radio.Button value="wechat"><WechatOutlined /> 微信支付</Radio.Button>
            <Radio.Button value="alipay"><AlipayCircleOutlined /> 支付宝</Radio.Button>
          </Radio.Group>
          {qrUrl ? (
            <img src={qrUrl} alt="支付二维码" style={{ width: 200, height: 200, display: 'block', margin: '0 auto' }} />
          ) : (
            <Spin />
          )}
          <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
            {polling ? '等待支付中...' : '请扫描二维码完成支付'}
          </Text>
        </div>
      </Modal>
    </div>
  )
}
