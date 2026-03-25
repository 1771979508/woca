import request from './request'

export const authApi = {
  getWxQrCode: () => request.get('/auth/wx/qrcode'),
  pollWxLogin: (sceneId: string) => request.get(`/auth/wx/poll?sceneId=${sceneId}`),
  getUserInfo: () => request.get('/auth/me'),
}

export const taskApi = {
  uploadVideo: (data: {
    videoUrl: string
    fileName: string
    x1?: number
    y1?: number
    x2?: number
    y2?: number
  }) => request.post('/tasks', data),
  getTaskList: (params?: { page?: number; pageSize?: number }) =>
    request.get('/tasks', { params }),
  getTaskDetail: (id: number) => request.get(`/tasks/${id}`),
  downloadTask: (id: number) => request.get(`/tasks/${id}/download`),
}

export const packageApi = {
  getPackageList: () => request.get('/packages'),
  createOrder: (packageId: number) => request.post('/orders', { packageId }),
  getOrderStatus: (orderId: number) => request.get(`/orders/${orderId}`),
  getPayQrCode: (orderId: number, channel: 'wechat' | 'alipay') =>
    request.get(`/orders/${orderId}/qrcode?channel=${channel}`),
}
