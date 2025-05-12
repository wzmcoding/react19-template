import { api } from "./api"

export const apiAuth = {
  login: (data: {
    phone: string
    code: string
  }) => {
    return api.action({
      url: 'login/by-h5',
      method: 'post',
      data,
    })
  },
  code: (data: {
    phone: string
  }) => {
    return api.action({
      url: 'login/code',
      method: 'post',
      data,
    })
  },
  logout: () => {
    return api.request({
      url: 'logout',
    })
  },
  info: () => {
    return api.query({
      url: 'user/info',
    })
  },
  changePassword: (data: {
    oldPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    return api.update({
      url: 'user/changePassword',
      data,
    })
  },
}
