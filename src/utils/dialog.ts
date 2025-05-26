/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner"
import { debounce, merge } from 'lodash-es'

export enum DIALOG {
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

interface LoadingParams {
  text?: string
  fullscreen?: boolean
  background?: string
  lock?: boolean
}

const LOADING_DEFAULTS: LoadingParams = {
  text: '拼命加载中',
  fullscreen: true,
  background: 'transparent',
  lock: true, // 遮罩
}

let loadingInstance: any
function loadingHide() {
  loadingInstance.close()
}
const debounced = debounce(loadingHide, 500)
const loading = {
  show(config: LoadingParams) {
    config = merge({}, LOADING_DEFAULTS, config)
    loadingInstance = ElLoading.service(config)
    return loadingInstance
  },
  hide(immediately = true) {
    if (immediately) {
      loadingHide()
    }
    else {
      debounced()
    }
  },
}

const TOAST_DEFAULTS: any = {
  message: '',
}
function DialogToast(config: any | string) {
  if (typeof config === 'string') {
    console.log('%c [ config ]-53', 'font-size:13px; background:pink; color:#bf2c9f;', config)
  }
  else {
    config = merge({}, TOAST_DEFAULTS, config)
  }
  return toast(config)
}

const NOTIFICATION_DEFAULTS: any = {
  title: '',
  message: '',
}
function notify(config: any | string) {
  if (typeof config === 'string') {
  }
  else {
    config = merge({}, NOTIFICATION_DEFAULTS, config)
  }
  return DialogToast(config)
}

const ALERT_DEFAULTS: any = {
  title: '',
  message: '',
}

function alert(config: any) {
  config = merge({}, ALERT_DEFAULTS, config)
  return DialogToast(config)
}

const CONFIRM_DEFAULTS: any = {
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  distinguishCancelAndClose: false,
}

function confirm(message: string, title?: string, config?: any) {
  config = merge({}, CONFIRM_DEFAULTS, config)
  return DialogToast({message, title, config})
}

const PROMPT_DEFAULTS: any = {
}

function prompt(message: string, title?: string, config?: any) {
  config = merge({}, PROMPT_DEFAULTS, config)
  return DialogToast({message, title, config})
}

export const dialog = {
  SUCCESS: DIALOG.SUCCESS,
  INFO: DIALOG.INFO,
  WARNING: DIALOG.WARNING,
  ERROR: DIALOG.ERROR,
  loading,
  toast: DialogToast,
  notify,
  alert,
  confirm,
  prompt,
}
