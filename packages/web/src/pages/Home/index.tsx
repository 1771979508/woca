import { useState } from 'react'
import { Card, Button, Input, Row, Col, Statistic, Upload, message, Typography, Space, Divider } from 'antd'
import { UploadOutlined, ThunderboltOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { taskApi } from '@/api'
import { useAuthStore } from '@/store/auth'

const { Title, Paragraph } = Typography

export default function HomePage() {
  const { userInfo } = useAuthStore()
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!videoUrl.trim()) { message.warning('请输入视频链接'); return }
    setLoading(true)
    try {
      await taskApi.uploadVideo({ videoUrl, fileName: videoUrl.split('/').pop() ?? 'video' })
      message.success('任务提交成功，可在「我的任务」中查看进度')
      setVideoUrl('')
    } catch (e: any) {
      message.error(e?.response?.data?.message ?? '提交失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Title level={4}>欢迎回来，{userInfo?.nickname ?? '用户'} 👋</Title>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="剩余时长"
              value={userInfo?.remainSeconds ?? 0}
              suffix="秒"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="今日处理" value={0} suffix="个" prefix={<ThunderboltOutlined />} />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card title="提交去字幕任务" style={{ marginTop: 8 }}>
        <Paragraph type="secondary">
          输入视频链接（支持 HTTP/HTTPS），系统将自动识别并去除字幕水印。
        </Paragraph>
        <Space.Compact style={{ width: '100%', marginTop: 12 }}>
          <Input
            placeholder="请输入视频链接，例如 https://example.com/video.mp4"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            size="large"
            onPressEnter={handleSubmit}
          />
          <Button type="primary" size="large" loading={loading} onClick={handleSubmit}>
            <UploadOutlined /> 提交任务
          </Button>
        </Space.Compact>
      </Card>
    </div>
  )
}
