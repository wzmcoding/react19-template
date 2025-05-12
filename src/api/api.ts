import { env } from '@/utils/env'
import API from '@/utils/request'

export const BASE_URL = env.isDev ? import.meta.env.VITE_API_URL_DEV : import.meta.env.VITE_API_URL_PROD

export const api = new API({
  baseURL: BASE_URL,
  successCode: '00',
  appendData: (config: any) => {
    config.params._t = +new Date()
  },
})

interface AliResponseData {
  task_id: string
  result: string
  status: number
  message: string
}

class ALI_API extends API {
  action(config: any) {
    return new Promise((resolve, reject) => {
      super.action(config).then((res) => {
        const data = res.data as AliResponseData
        resolve(data)
      }).catch((e) => {
        reject(e)
      })
    })
  }
}

// 后台以外的场景使用，比如阿里云api等
export const aliApi = new ALI_API({
  baseURL: BASE_URL,
  returnResponse: true,
})
