import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface SessionCredentials {
  idInstance: string
  apiTokenInstance: string
  apiUrl: string
}

export interface SessionState extends SessionCredentials {
  isAuthenticated: boolean
  signIn: (credentials: SessionCredentials) => void
  signOut: () => void
}

const initialCredentials: SessionCredentials = {
  idInstance: '',
  apiTokenInstance: '',
  apiUrl: '',
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...initialCredentials,
      isAuthenticated: false,
      signIn: (credentials) => set({ ...credentials, isAuthenticated: true }),
      signOut: () => {
        set({ ...initialCredentials, isAuthenticated: false })
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('max-green-api-session')
        }
      },
    }),
    {
      name: 'max-green-api-session',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
