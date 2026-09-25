import { useCallback, useState } from 'react'
import { getErrorMessage, getStateInstance } from '../shared/api/green-api'
import { useSessionStore, type SessionCredentials } from '../entities/session/session-store'

export function useAuth() {
  const idInstance = useSessionStore((state) => state.idInstance)
  const apiTokenInstance = useSessionStore((state) => state.apiTokenInstance)
  const apiUrl = useSessionStore((state) => state.apiUrl)
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)
  const signIn = useSessionStore((state) => state.signIn)
  const signOut = useSessionStore((state) => state.signOut)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(
    async (credentials: SessionCredentials): Promise<boolean> => {
      setIsConnecting(true)
      setError(null)
      try {
        await getStateInstance(credentials)
        signIn(credentials)
        return true
      } catch (requestError) {
        setError(getErrorMessage(requestError))
        return false
      } finally {
        setIsConnecting(false)
      }
    },
    [signIn],
  )

  const disconnect = useCallback(() => {
    signOut()
    setError(null)
  }, [signOut])

  return {
    idInstance,
    apiTokenInstance,
    apiUrl,
    isAuthenticated,
    isConnecting,
    error,
    connect,
    disconnect,
  }
}
