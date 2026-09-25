import { useCallback, useState } from 'react'
import { useChatStore, type ChatMessage } from '../../entities/chat/chat-store'
import { useSessionStore } from '../../entities/session/session-store'
import {
  checkAccount,
  getErrorMessage,
  isNoAccountError,
  sendMessage,
} from '../../shared/api/green-api'

function createLocalId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `local-${crypto.randomUUID()}`
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getResponseMessageId(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }
  return undefined
}

export function useSendMessage() {
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const chatId = useChatStore((state) => state.chatId)
  const addMessage = useChatStore((state) => state.addMessage)
  const updateMessage = useChatStore((state) => state.updateMessage)
  const resolveMessage = useChatStore((state) => state.resolveMessage)
  const updateChatId = useChatStore((state) => state.updateChatId)
  const idInstance = useSessionStore((state) => state.idInstance)
  const apiTokenInstance = useSessionStore((state) => state.apiTokenInstance)
  const apiUrl = useSessionStore((state) => state.apiUrl)

  const send = useCallback(
    async (value: string, existingMessageId?: string): Promise<boolean> => {
      const text = value.trim()
      if (!text || !chatId) {
        return false
      }

      const localId = existingMessageId ?? createLocalId()
      const optimisticMessage: ChatMessage = {
        id: localId,
        direction: 'outgoing',
        text,
        createdAt: Date.now(),
        status: 'sending',
      }

      if (existingMessageId) {
        updateMessage(existingMessageId, { status: 'sending', error: undefined })
      } else {
        addMessage(optimisticMessage)
      }
      setIsSending(true)
      setError(null)

      try {
        const response = await sendMessage({ idInstance, apiTokenInstance, apiUrl }, chatId, text)
        const idMessage = getResponseMessageId(response.idMessage)
        if (idMessage) {
          resolveMessage(localId, idMessage, 'sent')
        } else {
          updateMessage(localId, { status: 'sent', error: undefined })
        }
        return true
      } catch (requestError) {
        if (isNoAccountError(requestError)) {
          try {
            const account = await checkAccount(
              { idInstance, apiTokenInstance, apiUrl },
              useChatStore.getState().phoneNumber ?? '',
            )
            const refreshedChatId = account.chatId == null ? '' : String(account.chatId).trim()
            if (!account.exist || !refreshedChatId) {
              const accountError = 'В MAX нет аккаунта с этим номером.'
              updateMessage(localId, { status: 'failed', error: accountError })
              setError(accountError)
            } else {
              updateChatId(refreshedChatId)
              const accountChangedError =
                'Аккаунт получателя изменился. chatId обновлён — повторите отправку.'
              updateMessage(localId, { status: 'failed', error: accountChangedError })
              setError(accountChangedError)
            }
          } catch (refreshError) {
            const refreshErrorMessage = getErrorMessage(refreshError)
            updateMessage(localId, { status: 'failed', error: refreshErrorMessage })
            setError(refreshErrorMessage)
          }
        } else {
          const requestErrorMessage = getErrorMessage(requestError)
          updateMessage(localId, { status: 'failed', error: requestErrorMessage })
          setError(requestErrorMessage)
        }
        return false
      } finally {
        setIsSending(false)
      }
    },
    [
      addMessage,
      apiTokenInstance,
      apiUrl,
      chatId,
      idInstance,
      resolveMessage,
      updateChatId,
      updateMessage,
    ],
  )

  const retry = useCallback(
    (message: ChatMessage) => {
      if (!isSending && message.direction === 'outgoing' && message.status === 'failed') {
        void send(message.text, message.id)
      }
    },
    [isSending, send],
  )

  return {
    isSending,
    error,
    send,
    retry,
  }
}
