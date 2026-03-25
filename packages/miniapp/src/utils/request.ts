import Taro from '@tarojs/taro'

const BASE_URL = process.env.TARO_APP_API_URL ?? 'https://your-api-domain.com/api'

function request<T = any>(options: Taro.request.Option): Promise<T> {
  const token = Taro.getStorageSync('token')
  return new Promise((resolve, reject) => {
    Taro.request({
      ...options,
      url: BASE_URL + options.url,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
      },
      success: (res) => {
        if (res.statusCode === 401) {
          Taro.removeStorageSync('token')
          Taro.reLaunch({ url: '/pages/login/index' })
          reject(new Error('Unauthorized'))
        } else {
          resolve(res.data as T)
        }
      },
      fail: reject,
    })
  })
}

export const http = {
  get: <T = any>(url: string, data?: object) => request<T>({ url, method: 'GET', data }),
  post: <T = any>(url: string, data?: object) => request<T>({ url, method: 'POST', data }),
}
