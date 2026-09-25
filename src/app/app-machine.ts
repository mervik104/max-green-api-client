import { useChatStore } from '../entities/chat/chat-store'
import { useSessionStore } from '../entities/session/session-store'

export type AppScreen = 'auth' | 'contact' | 'chat'

export function useAppScreen(): AppScreen {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)
  const hasActiveChat = useChatStore((state) => Boolean(state.chatId))

  if (!isAuthenticated) {
    return 'auth'
  }
  if (hasActiveChat) {
    return 'chat'
  }
  return 'contact'
}
