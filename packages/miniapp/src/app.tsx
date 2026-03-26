import React, { useEffect } from 'react'
import Taro from '@tarojs/taro'
import './app.scss'

function App({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = Taro.getStorageSync('token')
    if (!token) {
      Taro.reLaunch({ url: '/pages/login/index' })
    }
  }, [])

  return <>{children}</>
}

export default App
