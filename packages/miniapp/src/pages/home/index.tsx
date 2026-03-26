import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Input, Button } from '@tarojs/components'
import { http } from '../../utils/request'
import './index.scss'

export default function HomePage() {
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    const info = Taro.getStorageSync('userInfo')
    if (info) setUserInfo(info)
  }, [])

  async function handleSubmit() {
    if (!videoUrl.trim()) { Taro.showToast({ title: '请输入视频链接', icon: 'none' }); return }
    setLoading(true)
    try {
      await http.post('/tasks', { videoUrl, fileName: videoUrl.split('/').pop() ?? 'video' })
      Taro.showToast({ title: '任务提交成功', icon: 'success' })
      setVideoUrl('')
    } catch {
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="home-page">
      <View className="welcome">
        <Text className="welcome-text">你好，{userInfo?.nickname ?? '用户'} 👋</Text>
        <Text className="remain">剩余时长：{userInfo?.remainSeconds ?? 0} 秒</Text>
      </View>

      <View className="card">
        <Text className="card-title">提交去字幕任务</Text>
        <Input
          className="url-input"
          value={videoUrl}
          onInput={(e) => setVideoUrl(e.detail.value)}
          placeholder="请输入视频链接 https://..."
          placeholderStyle="color:#bbb"
        />
        <Button className="submit-btn" loading={loading} onClick={handleSubmit}>
          提交任务
        </Button>
      </View>
    </View>
  )
}
