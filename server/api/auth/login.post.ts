/**
 * POST /api/auth/login
 * Přihlášení uživatele do CMS
 *
 * Bezpečnostní funkce:
 * - Rate limiting (5 pokusů / 15 min)
 * - Session tracking v DB
 * - Refresh token s rotací
 * - CSRF cookie
 */

import { connectToDatabase } from '@/server/utils/db'
import { User, Session } from '@/server/models'
import {
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  setAuthCookies,
  getSessionInfo,
} from '@/server/utils/auth'
import {
  checkRateLimit,
  resetRateLimit,
  getRateLimitKey,
  RATE_LIMIT_CONFIGS,
} from '@/server/utils/rateLimit'
import { setCsrfCookie } from '@/server/utils/csrf'
import { loginSchema } from '@/shared/schemas'
import {
  defineApiHandler,
  createValidationError,
  ApiError,
  ErrorCodes,
} from '@/server/utils/errors'

export default defineEventHandler(
  defineApiHandler(async (event) => {
    // Rate limiting check
    const rateLimitKey = getRateLimitKey(event, 'login')
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT_CONFIGS.login)

    if (!rateLimit.allowed) {
      throw new ApiError(
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        `Příliš mnoho pokusů o přihlášení. Zkuste to znovu za ${rateLimit.retryAfter} sekund.`,
        429
      )
    }

    await connectToDatabase()

    // Validace vstupu
    const body = await readBody(event)
    const result = loginSchema.safeParse(body)

    if (!result.success) {
      throw createValidationError('Neplatné přihlašovací údaje', {
        email: result.error.issues.find((i) => i.path[0] === 'email')?.message,
        password: result.error.issues.find((i) => i.path[0] === 'password')?.message,
      })
    }

    const { email, password } = result.data

    // Najít uživatele (s heslem)
    const user = await User.findOne({ email, isActive: true }).select('+password')

    if (!user) {
      throw new ApiError(ErrorCodes.INVALID_CREDENTIALS, 'Neplatný email nebo heslo', 401)
    }

    // Ověřit heslo
    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      throw new ApiError(ErrorCodes.INVALID_CREDENTIALS, 'Neplatný email nebo heslo', 401)
    }

    // Reset rate limitu po úspěšném přihlášení
    resetRateLimit(rateLimitKey)

    // Získat info o session
    const sessionInfo = getSessionInfo(event)

    // Vytvořit refresh token
    const refreshToken = generateRefreshToken()

    // Uložit session do DB
    const session = await Session.create({
      userId: user._id,
      refreshToken,
      userAgent: sessionInfo.userAgent,
      ipAddress: sessionInfo.ipAddress,
      isValid: true,
      expiresAt: getRefreshTokenExpiry(),
      lastActivityAt: new Date(),
    })

    // Aktualizovat poslední přihlášení
    user.lastLoginAt = new Date()
    await user.save()

    // Vygenerovat access token
    const authUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    }

    const accessToken = generateAccessToken(authUser, session._id.toString())

    // Nastavit cookies
    setAuthCookies(event, accessToken, refreshToken)

    // Nastavit CSRF cookie
    const csrfToken = setCsrfCookie(event)

    // Vrátit odpověď (bez hesla)
    return {
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt?.toISOString(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      csrfToken, // Klient uloží pro následné requesty
    }
  })
)
