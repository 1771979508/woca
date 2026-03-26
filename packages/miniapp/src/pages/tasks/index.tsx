import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { http } from '../../utils/request'
import './index.scss'

const statusMap: Record<string, { label: string; cls: string }> = {
  pending: { label: '等待中', cls: 'status-pending' },
  processing: { label: '处理中', cls: 'status-processing' },
  done: { label: '已完成', cls: 'status-done' },
  failed: { label: '失败', cls: 'status-failed' },
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchTasks() }, [])

  async function fetchTasks() {
    setLoading(true)
    try {
      const res: any = await http.get('/tasks')
      setTasks(res.data?.list ?? [])
    } catch {
      Taro.showToast({ title: '获取任务失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  function handleDownload(task: any) {
    if (task.status !== 'done') return
    Taro.navigateTo({ url: `/pages/taskDetail/index?id=${task.id}` })
  }

  return (
    <View className="tasks-page">
      <ScrollView scrollY style={{ height: '100vh' }}>
        {tasks.length === 0 && !loading && (
          <View className="empty"><Text>暂无任务</Text></View>
        )}
        {tasks.map((task) => {
          const s = statusMap[task.status] ?? { label: task.status, cls: '' }
          return (
            <View key={task.id} className="task-item" onClick={() => handleDownload(task)}>
              <View className="task-info">
                <Text className="task-name">{task.fileName}</Text>
                <Text className="task-time">{task.createdAt}</Text>
              </View>
              <View className={`task-status ${s.cls}`}>
                <Text>{s.label}</Text>
              </View>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}
