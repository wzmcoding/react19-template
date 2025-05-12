import qs from 'query-string'
import { UAParser } from 'ua-parser-js'
import { ls } from './storage'

const parser = UAParser()

const query = qs.parse(location.search)
const host = location.host

const isWeChat = /MicroMessenger/i.test(parser.ua) || query.ext === 'wechat'
const isMiniProgram = /miniProgram/i.test(parser.ua) || query.ext === 'miniProgram'
const isLocal = /^192|172|127|10|^localhost/i.test(host)
let debugMode = ls.get('debugMode') || import.meta.env.VITE_DEBUG === 'true'
if (query.debug) {
  debugMode = query.debug === 'true'
  ls.set('debugMode', debugMode)
}
let apiEnv = ls.get('apiEnv') || import.meta.env.VITE_API_ENV || 'prod'
// 允许通过URL参数临时修改接口环境
if (query.env && ['prod', 'dev'].includes(query.env as string)) {
  apiEnv = query.env as string
  console.log('临时修改接口环境为：', apiEnv, query.env)
  ls.set('apiEnv', apiEnv)
}
const isDev = apiEnv === 'dev'
const isProd = apiEnv === 'prod'
const isMobile = parser.device.type === 'mobile'
const isIOS = /iP(?:ad|hone|od)/.test(parser.device.model || '')

export const env = {
  ...parser,
  isWeChat,
  isMiniProgram,
  isBrowser: !isWeChat && !isMiniProgram,
  isLocal,
  isDev,
  isProd,
  apiEnv,
  debugMode,
  isMobile,
  isIOS,
}
if (isLocal) {
  console.log(env)
  console.log(import.meta.env)
}
