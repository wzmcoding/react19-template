import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type State = {
    token: string
    user: Partial<UserInfo>
}

type Actions = {
    setToken: (token: string) => void
    setUser: (user: Partial<UserInfo>) => void
    reset: () => void
}

interface UserInfo {
    avatar: string
    nickname: string
    uid: string
    phone: string
}

export const useUserStore = create<State & Actions>()(persist((set) => ({
    token: '',
    user: {},
    setToken: (token: string) => set(() => ({ token })),
    setUser: (user: Partial<UserInfo>) => set(() => ({ user })),
    reset: () => set(() => ({ token: '', user: {} })),
}), {
    name: 'user-storage',
}))
