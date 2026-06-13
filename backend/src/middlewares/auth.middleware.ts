import jwt from 'jsonwebtoken'
import { GraphQLError } from 'graphql'

export function getUserFromToken(token: string): string | undefined {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    return decoded.userId
  } catch {
    return undefined
  }
}

export function requireAuth(userId?: string): string {
  if (!userId) {
    throw new GraphQLError('Not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }
  return userId
}
