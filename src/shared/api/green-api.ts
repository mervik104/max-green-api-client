export interface GreenApiCredentials {
  idInstance: string
  apiTokenInstance: string
  apiUrl: string
}

export type ReceiptId = string | number

export interface CheckAccountResponse {
  exist: boolean
  chatId?: string | number | null
  phoneNumber?: string | number | null
  isRegistered?: boolean
  [key: string]: unknown
}

export interface SendMessageResponse {
  idMessage?: string | number
  status?: string | number
  [key: string]: unknown
}

export interface StateInstanceResponse {
  stateInstance?: string
  statusInstance?: string
  apiUrl?: string
  [key: string]: unknown
}

export interface SettingsResponse {
  apiUrl?: string
  [key: string]: unknown
}

export interface NotificationBody {
  type?: string
  typeMessage?: string
  chatId?: string | number
  from?: string
  idMessage?: string | number | null
  text?: string
  message?: string
  timestamp?: number | string
  [key: string]: unknown
}

export interface ReceiveNotificationResponse {
  receiptId?: ReceiptId | null
  body?: NotificationBody
  [key: string]: unknown
}

export class GreenApiError extends Error {
  readonly status: number | undefined
  readonly details: unknown
  readonly isNoAccount: boolean

  constructor(message: string, status?: number, details?: unknown) {
    super(message)
    this.name = 'GreenApiError'
    this.status = status
    this.details = details
    this.isNoAccount = isNoAccountText(message)
  }
}

const requestTimeoutMs = 75_000

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getErrorText(payload: unknown): string | undefined {
  if (!isRecord(payload)) {
    return undefined
  }

  const candidates = [payload.error, payload.message, payload.description]
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }
    if (isRecord(candidate) && typeof candidate.message === 'string' && candidate.message.trim()) {
      return candidate.message.trim()
    }
  }

  return undefined
}

function getStatusErrorText(payload: unknown): string | undefined {
  if (!isRecord(payload) || typeof payload.status !== 'string') {
    return undefined
  }
  return isNoAccountText(payload.status) ? payload.status : undefined
}

function isErrorPayload(payload: unknown): boolean {
  if (!isRecord(payload)) {
    return false
  }

  const status = payload.status
  return (
    getErrorText(payload) !== undefined ||
    getStatusErrorText(payload) !== undefined ||
    (typeof status === 'number' && status >= 400)
  )
}

function isNoAccountText(text: string): boolean {
  return /no[\s_-]*account|account(?:[\s_-]+is)?[\s_-]+not[\s_-]*(?:found|registered|authorized)|not[\s_-]*(?:registered|authorized)/i.test(
    text,
  )
}

function normalizeApiUrl(apiUrl: string): string {
  const value = apiUrl.trim()
  if (!value) {
    throw new GreenApiError('Укажите API URL Green API.')
  }

  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    throw new GreenApiError(
      'API URL должен быть корректным адресом, например https://api.example.com.',
    )
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new GreenApiError('API URL должен использовать http или https.')
  }

  return parsed.toString().replace(/\/+$/, '')
}

function buildUrl(credentials: GreenApiCredentials, path: string, suffix = ''): string {
  const idInstance = credentials.idInstance.trim()
  const apiTokenInstance = credentials.apiTokenInstance.trim()

  if (!idInstance || !apiTokenInstance) {
    throw new GreenApiError('Укажите idInstance и apiTokenInstance.')
  }

  return `${normalizeApiUrl(credentials.apiUrl)}/waInstance${encodeURIComponent(idInstance)}/${path}/${encodeURIComponent(apiTokenInstance)}${suffix}`
}

async function readPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    const text = await response.text()
    return text.trim() ? text : null
  }

  try {
    return await response.json()
  } catch {
    return null
  }
}

function formatHttpError(response: Response, payload: unknown): string {
  if (response.status === 401) {
    return 'Green API отклонил idInstance или apiTokenInstance. Проверьте данные доступа.'
  }
  if (response.status === 403) {
    return 'Доступ к этому инстансу запрещён. Проверьте права в личном кабинете Green API.'
  }
  if (response.status === 429) {
    return 'Лимит запросов Green API исчерпан. Попробуйте позже.'
  }
  if (response.status >= 500) {
    return 'Сервер Green API временно недоступен. Попробуйте повторить запрос.'
  }

  const details = getErrorText(payload) ?? getStatusErrorText(payload)
  return details
    ? `Ошибка Green API (${response.status}): ${details}`
    : `Green API вернул ошибку ${response.status}.`
}

async function request<T>(
  credentials: GreenApiCredentials,
  path: string,
  init: RequestInit,
  signal?: AbortSignal,
  suffix = '',
): Promise<T> {
  const url = buildUrl(credentials, path, suffix)
  const controller = new AbortController()
  const timeoutId = globalThis.setTimeout(() => controller.abort(), requestTimeoutMs)
  const abortFromCaller = (): void => controller.abort()

  if (signal) {
    if (signal.aborted) {
      controller.abort()
    } else {
      signal.addEventListener('abort', abortFromCaller, { once: true })
    }
  }

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
      signal: controller.signal,
    })
    const payload = await readPayload(response)

    if (!response.ok) {
      throw new GreenApiError(formatHttpError(response, payload), response.status, payload)
    }

    if (isErrorPayload(payload)) {
      throw new GreenApiError(
        getErrorText(payload) ?? getStatusErrorText(payload) ?? 'Green API вернул ошибку.',
        response.status,
        payload,
      )
    }

    return payload as T
  } catch (error) {
    if (error instanceof GreenApiError) {
      throw error
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      if (signal?.aborted) {
        throw error
      }
      throw new GreenApiError('Превышено время ожидания ответа Green API.')
    }

    if (error instanceof TypeError) {
      throw new GreenApiError(
        'Не удалось обратиться к Green API. Проверьте адрес API URL и ограничения CORS браузера.',
      )
    }

    throw error
  } finally {
    globalThis.clearTimeout(timeoutId)
    signal?.removeEventListener('abort', abortFromCaller)
  }
}

function jsonBody(body: Record<string, unknown>): RequestInit {
  return {
    method: 'POST',
    body: JSON.stringify(body),
  }
}

export function checkAccount(
  credentials: GreenApiCredentials,
  phoneNumber: string,
  signal?: AbortSignal,
): Promise<CheckAccountResponse> {
  return request<CheckAccountResponse>(
    credentials,
    'checkAccount',
    jsonBody({ phoneNumber }),
    signal,
  )
}

export function sendMessage(
  credentials: GreenApiCredentials,
  chatId: string,
  message: string,
  signal?: AbortSignal,
): Promise<SendMessageResponse> {
  return request<SendMessageResponse>(
    credentials,
    'sendMessage',
    jsonBody({ chatId, message }),
    signal,
  )
}

export function receiveNotification(
  credentials: GreenApiCredentials,
  signal?: AbortSignal,
): Promise<ReceiveNotificationResponse | null> {
  return request<ReceiveNotificationResponse | null>(
    credentials,
    'receiveNotification',
    { method: 'GET' },
    signal,
  )
}

export function deleteNotification(
  credentials: GreenApiCredentials,
  receiptId: ReceiptId,
  signal?: AbortSignal,
): Promise<unknown> {
  return request<unknown>(
    credentials,
    'deleteNotification',
    { method: 'DELETE' },
    signal,
    `/${encodeURIComponent(String(receiptId))}`,
  )
}

export function getStateInstance(
  credentials: GreenApiCredentials,
  signal?: AbortSignal,
): Promise<StateInstanceResponse> {
  return request<StateInstanceResponse>(credentials, 'getStateInstance', { method: 'GET' }, signal)
}

export function getSettings(
  credentials: GreenApiCredentials,
  signal?: AbortSignal,
): Promise<SettingsResponse> {
  return request<SettingsResponse>(credentials, 'getSettings', { method: 'GET' }, signal)
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof GreenApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Произошла неизвестная ошибка. Попробуйте ещё раз.'
}

export function isNoAccountError(error: unknown): boolean {
  return error instanceof GreenApiError && error.isNoAccount
}
