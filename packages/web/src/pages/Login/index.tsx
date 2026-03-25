import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Spin, Typography, message } from 'antd'
import { authApi } from '@/api'
import { useAuthStore } from '@/store/auth'

const { Title, Text } = Typography

export default function LoginPage() {
  const navigate = useNavigate()
  const { setToken, setUserInfo, token } = useAuthStore()
  const [qrUrl, setQrUrl] = useState('')
  const [sceneId, setSceneId] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (token) { navigate('/'); return }
    loadQrCode()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  async function loadQrCode() {
    try {
      const res: any = await authApi.getWxQrCode()
      setQrUrl(res.data.qrUrl)
      setSceneId(res.data.sceneId)
      timerRef.current = setInterval(() => pollLogin(res.data.sceneId), 2000)
    } catch {
      message.error('获取二维码失败，请刷新重试')
    }
  }

  async function pollLogin(sid: string) {
    try {
      const res: any = await authApi.pollWxLogin(sid)
      if (res.data?.token) {
        if (timerRef.current) clearInterval(timerRef.current)
        setToken(res.data.token)
        setUserInfo(res.data.userInfo)
        navigate('/')
      }
    } catch {
      // 轮询失败静默处理
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card style={{ width: 360, textAlign: 'center', borderRadius: 16 }}>
        <Title level={3} style={{ marginBottom: 8 }}>🎬 Woca</Title>
        <Text type="secondary">视频去字幕 · 画质增强平台</Text>
        <div style={{ margin: '24px 0' }}>
          {qrUrl ? (
            <img src={qrUrl} alt="微信扫码登录" style={{ width: 200, height: 200 }} />
          ) : (
            <Spin size="large" style={{ display: 'block', margin: '60px auto' }} />
          )}
        </div>
        <Text type="secondary">请使用微信扫描二维码登录</Text>
      </Card>
    </div>
  )
}
