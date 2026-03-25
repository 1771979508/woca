import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { http } from '../../utils/request'
import './index.scss'

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [paying, setPaying] = useState(false)

  useEffect(() => { fetchPackages() }, [])

  async function fetchPackages() {
    try {
      const res: any = await http.get('/packages')
      setPackages(res.data ?? [])
    } catch {
      Taro.showToast({ title: '获取套餐失败', icon: 'none' })
    }
  }

  async function handleBuy(pkg: any) {
    setPaying(true)
    try {
      const res: any = await http.post('/orders', { packageId: pkg.id })
      const { prepayId } = res.data
      await Taro.requestPayment({
        timeStamp: prepayId.timeStamp,
        nonceStr: prepayId.nonceStr,
        package: prepayId.package,
        signType: prepayId.signType,
        paySign: prepayId.paySign,
      })
      Taro.showToast({ title: '支付成功', icon: 'success' })
    } catch (e: any) {
      if (e?.errMsg !== 'requestPayment:fail cancel') {
        Taro.showToast({ title: '支付失败', icon: 'none' })
      }
    } finally {
      setPaying(false)
    }
  }

  return (
    <View className="packages-page">
      <Text className="page-title">选择套餐</Text>
      {packages.map((pkg) => (
        <View key={pkg.id} className="pkg-card">
          {pkg.isPopular && <View className="popular-tag"><Text>热门</Text></View>}
          <Text className="pkg-name">{pkg.name}</Text>
          <Text className="pkg-price">¥{pkg.price}</Text>
          <Text className="pkg-desc">{pkg.seconds} 秒时长</Text>
          <Button className="buy-btn" loading={paying} onClick={() => handleBuy(pkg)}>
            立即购买
          </Button>
        </View>
      ))}
    </View>
  )
}
