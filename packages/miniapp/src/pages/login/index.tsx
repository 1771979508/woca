import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Image, Button } from '@tarojs/components'
import { http } from '../../utils/request'
import './index.scss'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = Taro.getStorageSync('token')
    if (token) Taro.reLaunch({ url: '/pages/home/index' })
  }, [])

  async function handleLogin() {
    setLoading(true)
    try {
      const { code } = await Taro.login()
      const res: any = await http.post('/auth/wx/miniapp', { code })
      if (res.data?.token) {
        Taro.setStorageSync('token', res.data.token)
        Taro.setStorageSync('userInfo', res.data.userInfo)
        Taro.reLaunch({ url: '/pages/home/index' })
      } else {
        Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="login-page">
      <View className="logo-area">
        <Text className="logo-text">🎬</Text>
        <Text className="app-name">Woca</Text>
        <Text className="app-desc">视频去字幕 · 画质增强平台</Text>
      </View>
      <Button className="login-btn" loading={loading} onClick={handleLogin}>
        微信一键登录
      </Button>
    </View>
  )
}
