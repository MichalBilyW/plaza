/**
 * Jednotný Error Model pro API
 *
 * Všechny API endpointy vrací chyby v tomto formátu.
 */

import type { H3Event} from 'h3';
import { createError as h3CreateError } from 'h3'
import { ZodError } from 'zod'
import type { ApiErrorResponse } from '@/shared/types'

// ==========================================
// ERROR CODES
// ==========================================

export const ErrorCodes = {
	// Validation
	VALIDATION_ERROR: 'VALIDATION_ERROR',
	INVALID_INPUT: 'INVALID_INPUT',

	// Auth
	UNAUTHORIZED: 'UNAUTHORIZED',
	FORBIDDEN: 'FORBIDDEN',
	INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
	TOKEN_EXPIRED: 'TOKEN_EXPIRED',
	TOKEN_INVALID: 'TOKEN_INVALID',

	// Resources
	NOT_FOUND: 'NOT_FOUND',
	ALREADY_EXISTS: 'ALREADY_EXISTS',
	CONFLICT: 'CONFLICT',

	// Server
	INTERNAL_ERROR: 'INTERNAL_ERROR',
	DATABASE_ERROR: 'DATABASE_ERROR',
	RATE_LIMITED: 'RATE_LIMITED',
	RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

// ==========================================
// API ERROR CLASS
// ==========================================

export class ApiError extends Error {
	code: ErrorCode
	statusCode: number
	fields?: Record<string, string>

	constructor(
		code: ErrorCode,
		message: string,
		statusCode: number = 400,
		fields?: Record<string, string>,
	) {
		super(message)
		this.name = 'ApiError'
		this.code = code
		this.statusCode = statusCode
		this.fields = fields
	}

	toResponse(): ApiErrorResponse {
		return {
			code: this.code,
			message: this.message,
			statusCode: this.statusCode,
			fields: this.fields,
		}
	}
}

// ==========================================
// ERROR FACTORIES
// ==========================================

export function createValidationError(message: string, fields?: Record<string, string>): ApiError {
	return new ApiError(ErrorCodes.VALIDATION_ERROR, message, 400, fields)
}

export function createUnauthorizedError(message: string = 'Nejste přihlášen'): ApiError {
	return new ApiError(ErrorCodes.UNAUTHORIZED, message, 401)
}

export function createForbiddenError(message: string = 'Nemáte oprávnění k této akci'): ApiError {
	return new ApiError(ErrorCodes.FORBIDDEN, message, 403)
}

export function createNotFoundError(resource: string = 'Záznam'): ApiError {
	return new ApiError(ErrorCodes.NOT_FOUND, `${resource} nebyl nalezen`, 404)
}

export function createConflictError(message: string): ApiError {
	return new ApiError(ErrorCodes.CONFLICT, message, 409)
}

export function createInternalError(message: string = 'Interní chyba serveru'): ApiError {
	return new ApiError(ErrorCodes.INTERNAL_ERROR, message, 500)
}

export function createRateLimitError(): ApiError {
	return new ApiError(ErrorCodes.RATE_LIMITED, 'Příliš mnoho požadavků, zkuste to později', 429)
}

// ==========================================
// ZOD ERROR TRANSFORMER
// ==========================================

export function zodErrorToApiError(error: ZodError): ApiError {
	const fields: Record<string, string> = {}

	for (const issue of error.issues) {
		const path = issue.path.join('.')
		fields[path] = issue.message
	}

	const firstError = error.issues[0]?.message || 'Neplatná data'

	return new ApiError(ErrorCodes.VALIDATION_ERROR, firstError, 400, fields)
}

// ==========================================
// ERROR HANDLER MIDDLEWARE
// ==========================================

/**
 * Wrapper pro API handlery s automatickým error handlingem
 */
export function defineApiHandler<T>(
	handler: (event: H3Event) => Promise<T>,
): (event: H3Event) => Promise<T | ApiErrorResponse> {
	return async (event: H3Event) => {
		try {
			return await handler(event)
		} catch (error) {
			// Zod validation error
			if (error instanceof ZodError) {
				const apiError = zodErrorToApiError(error)
				throw h3CreateError({
					statusCode: apiError.statusCode,
					statusMessage: apiError.message,
					data: apiError.toResponse(),
				})
			}

			// Our custom ApiError
			if (error instanceof ApiError) {
				throw h3CreateError({
					statusCode: error.statusCode,
					statusMessage: error.message,
					data: error.toResponse(),
				})
			}

			// Mongoose errors
			if (error && typeof error === 'object' && 'name' in error) {
				const mongoError = error as { name: string; message: string; code?: number }

				if (mongoError.name === 'CastError') {
					const notFoundError = createNotFoundError()
					throw h3CreateError({
						statusCode: notFoundError.statusCode,
						statusMessage: notFoundError.message,
						data: notFoundError.toResponse(),
					})
				}

				if (mongoError.code === 11000) {
					const conflictError = createConflictError('Záznam s těmito údaji již existuje')
					throw h3CreateError({
						statusCode: conflictError.statusCode,
						statusMessage: conflictError.message,
						data: conflictError.toResponse(),
					})
				}
			}

			// Unknown error
			console.error('Unhandled API error:', error)
			const internalError = createInternalError()
			throw h3CreateError({
				statusCode: internalError.statusCode,
				statusMessage: internalError.message,
				data: internalError.toResponse(),
			})
		}
	}
}
