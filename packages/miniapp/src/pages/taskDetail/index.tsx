import { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { http } from '../../utils/request'
import './index.scss'

export default function TaskDetailPage() {
  const router = useRouter()
  const id = router.params.id
  const [task, setTask] = useState<any>(null)

  useEffect(() => { if (id) fetchDetail(id) }, [id])

  async function fetchDetail(taskId: string) {
    try {
      const res: any = await http.get(`/tasks/${taskId}`)
      setTask(res.data)
    } catch {
      Taro.showToast({ title: '获取详情失败', icon: 'none' })
    }
  }

  async function handleDownload() {
    try {
      const res: any = await http.get(`/tasks/${id}/download`)
      Taro.setClipboardData({ data: res.data.url })
      Taro.showToast({ title: '下载链接已复制', icon: 'success' })
    } catch {
      Taro.showToast({ title: '获取下载链接失败', icon: 'none' })
    }
  }

  if (!task) return <View className="loading"><Text>加载中...</Text></View>

  return (
    <View className="detail-page">
      <View className="info-card">
        <View className="info-row"><Text className="label">文件名</Text><Text className="value">{task.fileName}</Text></View>
        <View className="info-row"><Text className="label">时长</Text><Text className="value">{task.duration} 秒</Text></View>
        <View className="info-row"><Text className="label">分辨率</Text><Text className="value">{task.width}x{task.height}</Text></View>
        <View className="info-row"><Text className="label">状态</Text><Text className="value">{task.status}</Text></View>
        <View className="info-row"><Text className="label">提交时间</Text><Text className="value">{task.createdAt}</Text></View>
      </View>
      {task.status === 'done' && (
        <Button className="download-btn" onClick={handleDownload}>复制下载链接</Button>
      )}
    </View>
  )
}
