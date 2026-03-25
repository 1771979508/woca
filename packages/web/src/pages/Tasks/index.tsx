import { useEffect, useState } from 'react'
import { Table, Tag, Button, Space, message, Typography, Tooltip } from 'antd'
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons'
import { taskApi } from '@/api'

const { Title } = Typography

const statusMap: Record<string, { color: string; label: string }> = {
  pending: { color: 'default', label: '等待中' },
  processing: { color: 'processing', label: '处理中' },
  done: { color: 'success', label: '已完成' },
  failed: { color: 'error', label: '失败' },
}

export default function TasksPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  useEffect(() => { fetchTasks() }, [])

  async function fetchTasks(page = 1) {
    setLoading(true)
    try {
      const res: any = await taskApi.getTaskList({ page, pageSize: pagination.pageSize })
      setData(res.data.list)
      setPagination((p) => ({ ...p, current: page, total: res.data.total }))
    } catch {
      message.error('获取任务列表失败')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload(id: number) {
    try {
      const res: any = await taskApi.downloadTask(id)
      window.open(res.data.url, '_blank')
    } catch {
      message.error('获取下载链接失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    {
      title: '文件名',
      dataIndex: 'fileName',
      ellipsis: true,
      render: (v: string) => <Tooltip title={v}>{v}</Tooltip>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v: string) => (
        <Tag color={statusMap[v]?.color ?? 'default'}>{statusMap[v]?.label ?? v}</Tag>
      ),
    },
    { title: '时长(秒)', dataIndex: 'duration', width: 100 },
    { title: '提交时间', dataIndex: 'createdAt', width: 180 },
    {
      title: '操作',
      width: 120,
      render: (_: any, row: any) => (
        <Button
          type="link"
          icon={<DownloadOutlined />}
          disabled={row.status !== 'done'}
          onClick={() => handleDownload(row.id)}
        >
          下载
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Title level={4} style={{ margin: 0 }}>我的任务</Title>
        <Button icon={<ReloadOutlined />} onClick={() => fetchTasks()}>刷新</Button>
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={columns}
        pagination={{
          ...pagination,
          onChange: (page) => fetchTasks(page),
          showTotal: (t) => `共 ${t} 条`,
        }}
      />
    </div>
  )
}
