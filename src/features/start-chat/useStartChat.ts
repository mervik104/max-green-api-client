import { useCallback, useState } from 'react'
import { useChatStore } from '../../entities/chat/chat-store'
import { useSessionStore } from '../../entities/session/session-store'
import { checkAccount, getErrorMessage } from '../../shared/api/green-api'

const minimumPhoneLength = 7
const maximumPhoneLength = 15

export interface StartChatResult {
  ok: boolean
  error: string | null
}

export function useStartChat() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const idInstance = useSessionStore((state) => state.idInstance)
  const apiTokenInstance = useSessionStore((state) => state.apiTokenInstance)
  const apiUrl = useSessionStore((state) => state.apiUrl)
  const setChat = useChatStore((state) => state.setChat)

  const startChat = useCallback(async (): Promise<StartChatResult> => {
    const value = phoneNumber.trim()
    setError(null)
    setStatus('Проверка номера…')

    if (!value) {
      const validationError = 'Введите номер телефона получателя.'
      setError(validationError)
      setStatus(null)
      return { ok: false, error: validationError }
    }
    if (!/^\d+$/.test(value)) {
      const validationError = 'Введите номер только цифрами, включая код страны.'
      setError(validationError)
      setStatus(null)
      return { ok: false, error: validationError }
    }
    if (
      value.length < minimumPhoneLength ||
      value.length > maximumPhoneLength ||
      !/^[1-9]\d*$/.test(value)
    ) {
      const validationError = 'Номер должен содержать от 7 до 15 цифр и начинаться с кода страны.'
      setError(validationError)
      setStatus(null)
      return { ok: false, error: validationError }
    }

    setIsChecking(true)
    try {
      const account = await checkAccount({ idInstance, apiTokenInstance, apiUrl }, value)
      if (!account.exist) {
        const accountError = 'В MAX нет аккаунта с этим номером.'
        setError(accountError)
        setStatus(null)
        return { ok: false, error: accountError }
      }

      const chatId = account.chatId == null ? '' : String(account.chatId).trim()
      if (!chatId) {
        const responseError = 'MAX не вернул chatId для этого номера.'
        setError(responseError)
        setStatus(null)
        return { ok: false, error: responseError }
      }

      setChat(chatId, value)
      setStatus(null)
      return { ok: true, error: null }
    } catch (requestError) {
      const requestErrorMessage = getErrorMessage(requestError)
      setError(requestErrorMessage)
      setStatus(null)
      return { ok: false, error: requestErrorMessage }
    } finally {
      setIsChecking(false)
    }
  }, [apiTokenInstance, apiUrl, idInstance, phoneNumber, setChat])

  const reset = useCallback(() => {
    setPhoneNumber('')
    setError(null)
    setStatus(null)
  }, [])

  return {
    phoneNumber,
    setPhoneNumber,
    isChecking,
    error,
    status,
    startChat,
    reset,
  }
}
