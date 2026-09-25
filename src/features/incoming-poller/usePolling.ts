import { useEffect } from 'react'
import { useChatStore, type ChatMessage } from '../../entities/chat/chat-store'
import { useSessionStore } from '../../entities/session/session-store'
import {
  deleteNotification,
  getErrorMessage,
  receiveNotification,
  type NotificationBody,
  type ReceiptId,
} from '../../shared/api/green-api'

const allowedMessageTypes = new Set(['textMessage', 'extendedTextMessage'])
const allowedNotificationTypes = new Set(['incomingMessageReceived', 'outgoingMessageReceived'])
const retryDelayMs = 2_500
const idleDelayMs = 350

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getText(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function getId(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }
  return undefined
}

function getTimestamp(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value < 1_000_000_000_000 ? value * 1_000 : value
  }
  if (typeof value === 'string') {
    if (/^\d+$/.test(value)) {
      return getTimestamp(Number(value))
    }

    const parsed = Date.parse(value)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }
  return Date.now()
}

function getBody(notification: {
  body?: NotificationBody
  [key: string]: unknown
}): NotificationBody | null {
  if (isRecord(notification.body)) {
    return notification.body as NotificationBody
  }
  return notification as NotificationBody
}

function getReceiptId(notification: unknown): ReceiptId | null {
  if (!isRecord(notification)) {
    return null
  }
  const receiptId = notification.receiptId
  if (typeof receiptId === 'string' && receiptId.trim()) {
    return receiptId
  }
  if (typeof receiptId === 'number' && Number.isFinite(receiptId)) {
    return receiptId
  }
  return null
}

function createMessage(
  body: NotificationBody,
  direction: 'incoming' | 'outgoing',
): ChatMessage | null {
  const type = getText(body.type)
  const typeMessage = getText(body.typeMessage)
  const text = getText(body.text) ?? getText(body.message)
  const chatId = getId(body.chatId)

  if (
    !type ||
    !typeMessage ||
    !allowedNotificationTypes.has(type) ||
    !allowedMessageTypes.has(typeMessage)
  ) {
    return null
  }
  if (!text?.trim() || !chatId) {
    return null
  }

  const idMessage = getId(body.idMessage)
  const createdAt = getTimestamp(body.timestamp)
  const id = idMessage ?? `local-incoming-${chatId}-${createdAt}-${text.slice(0, 24)}`

  return {
    id,
    idMessage,
    direction,
    text,
    createdAt,
    status: direction === 'incoming' ? 'delivered' : 'sent',
  }
}

export function usePolling(): void {
  const activeChatId = useChatStore((state) => state.chatId)
  const idInstance = useSessionStore((state) => state.idInstance)
  const apiTokenInstance = useSessionStore((state) => state.apiTokenInstance)
  const apiUrl = useSessionStore((state) => state.apiUrl)
  const addMessage = useChatStore((state) => state.addMessage)
  const setPollingStatus = useChatStore((state) => state.setPollingStatus)

  useEffect(() => {
    if (!activeChatId || !idInstance || !apiTokenInstance || !apiUrl) {
      return
    }

    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    let failures = 0
    const controller = new AbortController()

    const scheduleNext = (delay: number): void => {
      if (!cancelled) {
        timeoutId = setTimeout(() => {
          void run()
        }, delay)
      }
    }

    async function run(): Promise<void> {
      if (cancelled) {
        return
      }

      try {
        const notification = await receiveNotification(
          { idInstance, apiTokenInstance, apiUrl },
          controller.signal,
        )
        const receiptId = getReceiptId(notification)

        if (receiptId !== null) {
          try {
            const body = notification ? getBody(notification) : null
            if (body) {
              const type = getText(body.type)
              const message = type
                ? createMessage(body, type === 'incomingMessageReceived' ? 'incoming' : 'outgoing')
                : null
              if (message && getId(body.chatId) === activeChatId) {
                addMessage(message)
              }
            }
          } finally {
            await deleteNotification(
              { idInstance, apiTokenInstance, apiUrl },
              receiptId,
              controller.signal,
            )
          }
        }

        failures = 0
        if (!cancelled) {
          setPollingStatus('waiting')
        }
        scheduleNext(idleDelayMs)
      } catch (error) {
        if (cancelled || (error instanceof DOMException && error.name === 'AbortError')) {
          return
        }
        failures += 1
        if (!cancelled) {
          setPollingStatus('error', getErrorMessage(error))
        }
        scheduleNext(retryDelayMs + Math.min(failures * 500, 5_000))
      }
    }

    setPollingStatus('starting')
    scheduleNext(0)

    return () => {
      cancelled = true
      controller.abort()
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [activeChatId, addMessage, apiTokenInstance, apiUrl, idInstance, setPollingStatus])
}
