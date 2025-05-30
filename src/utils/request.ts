import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'
import { debounce, merge } from 'lodash-es'
import { SSE } from 'sse.js'

import { buildURL, combineURLs, isAbsoluteURL } from '@/utils/url'
import { dialog } from '@/utils/dialog'
export interface ResponseData {
  status: string
  errMsg: string
  data: any
}

export interface SSEResponseData {
  source: SSE
  data: any
  readyState?: number
}

export interface BaseEntity {
  [key: string]: any
}

export interface RequestConfig extends AxiosRequestConfig {
  successCode?: number | string // 后台返回表示成功的状态码
  loading?: {
    enable?: boolean
    text?: string
    lock?: boolean
  }
  message?: {
    success?: {
      enable?: boolean
      text?: string
      title?: string
      type?: 'toast' | 'alert' | 'notify'
    }
    error?: {
      enable?: boolean
      text?: string
      title?: string
      type?: 'toast' | 'alert' | 'notify'
    }
  }
  resultHandler?: (res: any) => any // 查询结果处理
  logoutHandler?: (e: Error) => any // 登录失效处理
  appendData?: (config: RequestConfig) => void // 添加公共参数
  returnResponse?: boolean // 不解析response返回data，直接视为成功并返回
}

export interface UploadRequestConfig extends RequestConfig {
  data: {
    files?: File
    filename?: string
    [key: string]: any
  }
}

export interface SSERequestConfig extends RequestConfig {
  onMessage: (data: any) => void
  onError: (error: Error) => void
}

export const DEFAULTS: RequestConfig = {
  successCode: '00', // 后台返回表示成功的状态码
  loading: {
    enable: false,
    text: '加载中...',
    lock: true,
  },
  message: {
    success: {
      enable: false,
      type: 'toast',
    },
    error: {
      enable: true,
      type: 'notify',
    },
  },
  returnResponse: false, // 不解析response返回data，直接视为成功并返回
}

function showLoading({ text = '加载中...', lock = true }) {
  dialog.loading.show({
    text,
    lock,
  })
}

function hideLoading() {
  dialog.loading.hide()
}

function showError({ title, text, type }: { title?: string, text?: string, type?: 'toast' | 'alert' | 'notify' } = { title: '', text: '', type: 'notify' }) {
  dialog[type!]({
    type: dialog.ERROR,
    title,
    message: text || title,
  })
}

function showSuccess({ title, text, type }: { title?: string, text?: string, type?: 'toast' | 'alert' | 'notify' } = { title: '', text: '', type: 'toast' }) {
  dialog[type!]({
    type: dialog.SUCCESS,
    title,
    message: text || title,
  })
}

// 删除空参数
function deleteEmptyData(data: any) {
  if (data) {
    for (const key in data) {
      const val = data[key]
      if (typeof val === 'undefined' || val === '' || val === null) {
        delete data[key]
      }
    }
  }
  return data
}

// 添加通用参数
function appendData(config: RequestConfig) {
  if (!config.params) {
    config.params = {}
  }
  // 添加公共参数
  if (config.appendData) {
    config.appendData(config)
  }
  return config
}
const debouncedShowError = debounce((config, e) => {
  showError({
    ...config.message?.error,
    text: e.response?.data?.errMsg || e.message,
  })
}, 300)
class API {
  defaults: RequestConfig
  instance: AxiosInstance

  constructor(apiConfig: RequestConfig) {
    this.defaults = merge({}, DEFAULTS, apiConfig)
    this.instance = axios.create(this.defaults)
  }

  action(sourceConfig: RequestConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      const config = merge({}, this.defaults, sourceConfig)

      // 删除空参数
      deleteEmptyData(config.params)
      deleteEmptyData(config.data)
      // 添加公共参数
      appendData(config)

      if (config.loading?.enable) {
        showLoading(config.loading)
      }
      this.instance
        .request(config)
        .then((res) => {
          if (config.returnResponse) {
            if (config.message?.success?.enable) {
              showSuccess(config.message?.success)
            }
            resolve(res)
          }
          else {
            const result: ResponseData = res.data
            let { status, data } = result
            if (status === config.successCode) {
              if (config.message?.success?.enable) {
                showSuccess({
                  ...config.message?.success,
                  text: result.errMsg,
                })
              }
              if (config.resultHandler) {
                data = config.resultHandler(data)
              }
              resolve(data)
            }
            else {
              const e = new APIError(result)
              if (config.message?.error?.enable) {
                dialog.toast(e.message)
              }
              reject(e)
            }
          }
        })
        .catch((e: any) => {
          if (e.response?.data?.status === '02') {
            debouncedShowError(config, e)
            if (config.logoutHandler) {
              config.logoutHandler(e).then(() => {
                reject(e)
              })
            }
            else {
              reject(e)
            }
          }
          else {
            if (config.message?.error?.enable) {
              dialog.toast(e.response?.data?.errMsg || e.message)
            }
          }
        })
        .finally(() => {
          if (config.loading?.enable) {
            hideLoading()
          }
        })
    })
  }

  request(config: RequestConfig) {
    config = merge(
      {
        message: {
          success: {
            enable: true,
            title: '操作成功',
          },
          error: {
            enable: true,
            title: '操作失败',
          },
        },
      },
      config,
    )
    return this.action(config)
  }

  query(config: RequestConfig) {
    config = merge(
      {
        method: 'GET',
        message: {
          success: {
            enable: false,
          },
          error: {
            enable: true,
            title: '查询失败',
          },
        },
      },
      config,
    )
    return this.request(config)
  }

  page(config: RequestConfig, { pageSize = 10, currentPage = 1, simple = false }) {
    return new Promise((resolve, reject) => {
      config = merge(
        {
          method: 'GET',
          message: {
            success: {
              enable: false,
            },
            error: {
              enable: true,
              title: '查询失败',
            },
          },
        },
        config,
        {
          params: {
            pageLimit: pageSize,
            pageIndex: currentPage,
          },
        },
      )
      this.action(config)
        .then((res: any) => {
          let pagingData
          if (simple) {
            // 后端不返回分页信息
            pagingData = {
              list: res, // 分页数据(required)
              total: 0, // 总数(required)
              currentPage: 1, // 当前页码(required)
              pageSize: 0, // 分页数设定值
              length: 0, // 分页数实际值(比如设定pageSize为10，但最后一页只有7条记录，size为7)
              pages: 1, // 总页数
              startRow: 0, // 当前起始索引
              endRow: 0, // 当前结尾索引
            }
          }
          else {
            const list = res.records
            const total = res.total
            const currentPage = res.current || 1
            const pageSize = res.size
            const length = list.length
            const pages = res.pages || 1
            const startRow = (currentPage - 1) * pageSize + 1
            const endRow = startRow + length - 1

            pagingData = {
              list, // 分页数据(required)
              total, // 总数(required)
              currentPage, // 当前页码(required)
              pageSize, // 分页数设定值
              length, // 分页数实际值(比如设定pageSize为10，但最后一页只有7条记录，size为7)
              pages, // 总页数
              startRow, // 当前起始索引
              endRow, // 当前结尾索引
            }
          }
          if (config.resultHandler) {
            pagingData.list = config.resultHandler(pagingData.list)
          }
          resolve(pagingData)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  add(config: RequestConfig) {
    config = merge(
      {
        method: 'POST',
        message: {
          success: {
            enable: true,
            title: '添加成功',
          },
          error: {
            enable: true,
            title: '添加失败',
          },
        },
      },
      config,
    )
    return this.request(config)
  }

  update(config: RequestConfig) {
    config = merge(
      {
        method: 'POST',
        message: {
          success: {
            enable: true,
            title: '修改成功',
          },
          error: {
            enable: true,
            title: '修改失败',
          },
        },
      },
      config,
    )
    return this.request(config)
  }

  delete(config: RequestConfig) {
    config = merge(
      {
        method: 'POST',
        message: {
          success: {
            enable: true,
            title: '删除成功',
          },
          error: {
            enable: true,
            title: '删除失败',
          },
        },
      },
      config,
    )
    return this.request(config)
  }

  download(config: RequestConfig) {
    config = merge({}, this.defaults, config)

    // 删除空参数
    deleteEmptyData(config.params)
    deleteEmptyData(config.data)
    // 添加公共参数
    appendData(config)
    let { url, params } = config
    config = merge(
      {},
      this.defaults,
      config,
    )
    if (config.baseURL && !isAbsoluteURL(url!)) {
      url = combineURLs(config.baseURL, url!)
    }
    const headers = this.defaults.headers
    params = merge(
      {},
      headers,
      params,
    )
    window.open(buildURL(url!, params), '_blank')
  }

  upload(config: UploadRequestConfig) {
    config = merge(
      {},
      this.defaults,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        lock: false,
        showSuccess: false,
        // showError: false,
        method: 'POST',
        successMessage: '上传成功',
        errorMessage: '上传失败',
      },
      config,
    )
    const formData = new FormData()
    if (config.data) {
      Object.keys(config.data).forEach((key) => {
        formData.append(key, config.data[key])
      })
    }

    return new Promise((resolve, reject) => {
      this.request({
        ...config,
        data: formData,
      })
        .then((result) => {
          if (config.returnResponse) {
            resolve(result)
          }
          else {
            if (result && result[0]) {
              resolve(result[0])
            }
            else {
              reject(new APIError(result))
            }
          }
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  requestSSE(config: SSERequestConfig) {
    config = merge(
      {},
      this.defaults,
      {
        lock: false,
        showSuccess: false,
        method: 'POST',
        successMessage: '请求成功',
        errorMessage: '请求失败',
      },
      config,
    )
    // 删除空参数
    deleteEmptyData(config.params)
    deleteEmptyData(config.data)
    // 添加公共参数
    appendData(config)
    let { url, data, method } = config
    if (config.baseURL && !isAbsoluteURL(url!)) {
      url = combineURLs(config.baseURL, url!)
    }
    const headers = config.headers as any
    return new Promise((resolve, reject) => {
      // 创建一个新的SSE连接
      const eventSource = new SSE(url!, {
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        method,
        payload: JSON.stringify(data),
        start: false,
      })
      let isConnected = false
      eventSource.addEventListener('message', (res: SSEResponseData) => {
        try {
          const result = JSON.parse(res.data)
          if (!isConnected) {
            isConnected = true
            // 连接建立就视为请求完成
            resolve(Promise.resolve())
          }
          if (config.onMessage) {
            config.onMessage(result)
          }
        }
        catch (e: any) {
          if (config.message?.error?.enable) {
            dialog.toast(e.message)
          }
          reject(e)
        }
      })
      eventSource.addEventListener('error', (res: SSEResponseData) => {
        if (!isConnected) {
          // 连接建立失败
          let error = new Error(res.data)
          try {
            const result = JSON.parse(res.data)
            error = new APIError(result)
            if (config.message?.error?.enable) {
              dialog.toast(error.message)
            }
          }
          catch (e) {
            if (config.message?.error?.enable) {
              dialog.toast('请求失败')
            }
          }
          reject(error)
        }
        else {
          // 推送返回失败
          let error = new Error(res.data)
          try {
            const result = JSON.parse(res.data)
            error = new APIError(result)
          }
          catch (e) {
            console.log('%c [ e ]-543', 'font-size:13px; background:pink; color:#bf2c9f;', e)
          }
          if (config.onError) {
            config.onError(error)
          }
        }
      })
      eventSource.addEventListener('abort', (e: SSEResponseData) => {
        eventSource.close()
      })
      eventSource.stream()
    })
  }
}

export class APIError extends Error {
  data?: any
  code?: number | string

  constructor(result: ResponseData) {
    super(result.errMsg)
    this.data = result.data
    this.code = result.status
    this.name = 'APIError'
  }
}

export default API
