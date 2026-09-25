import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type MessageDirection = 'incoming' | 'outgoing'
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'failed'
export type PollingStatus = 'idle' | 'starting' | 'waiting' | 'error'

export interface ChatMessage {
  id: string
  idMessage?: string
  direction: MessageDirection
  text: string
  createdAt: number
  status: MessageStatus
  error?: string
}

export interface ChatState {
  chatId: string | null
  phoneNumber: string | null
  messages: ChatMessage[]
  pollingStatus: PollingStatus
  pollingError: string | null
  setChat: (chatId: string, phoneNumber: string) => void
  updateChatId: (chatId: string) => void
  clearChat: () => void
  setPollingStatus: (status: PollingStatus, error?: string | null) => void
  addMessage: (message: ChatMessage) => void
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void
  resolveMessage: (localId: string, idMessage: string, status: MessageStatus) => void
  clearError: () => void
}

const emptyChat = {
  chatId: null,
  phoneNumber: null,
  messages: [],
  pollingStatus: 'idle' as PollingStatus,
  pollingError: null,
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      ...emptyChat,
      setChat: (chatId, phoneNumber) =>
        set((state) => {
          if (state.chatId === chatId) {
            return { chatId, phoneNumber, pollingError: null }
          }
          return { ...emptyChat, chatId, phoneNumber }
        }),
      updateChatId: (chatId) => set({ chatId }),
      clearChat: () => {
        set(emptyChat)
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('max-green-api-chat')
        }
      },
      setPollingStatus: (pollingStatus, pollingError = null) =>
        set({ pollingStatus, pollingError }),
      addMessage: (message) =>
        set((state) => {
          const duplicateIndex = state.messages.findIndex(
            (item) =>
              (Boolean(message.idMessage) && item.idMessage === message.idMessage) ||
              item.id === message.id,
          )
          if (duplicateIndex === -1) {
            return { messages: [...state.messages, message] }
          }

          return {
            messages: state.messages.map((item, index) =>
              index === duplicateIndex ? { ...item, ...message } : item,
            ),
          }
        }),
      updateMessage: (id, patch) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === id ? { ...message, ...patch } : message,
          ),
        })),
      resolveMessage: (localId, idMessage, status) =>
        set((state) => {
          const serverIndex = state.messages.findIndex((message) => message.idMessage === idMessage)
          if (serverIndex !== -1) {
            return {
              messages: state.messages
                .filter((message) => message.id !== localId || message.idMessage === idMessage)
                .map((message) =>
                  message.idMessage === idMessage
                    ? { ...message, idMessage, status, error: undefined }
                    : message,
                ),
            }
          }

          return {
            messages: state.messages.map((message) =>
              message.id === localId
                ? { ...message, id: idMessage, idMessage, status, error: undefined }
                : message,
            ),
          }
        }),
      clearError: () => set({ pollingError: null }),
    }),
    {
      name: 'max-green-api-chat',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        chatId: state.chatId,
        phoneNumber: state.phoneNumber,
        messages: state.messages,
      }),
    },
  ),
)
