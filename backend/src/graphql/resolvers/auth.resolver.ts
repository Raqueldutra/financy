import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { GraphQLError } from 'graphql'
import prisma from '../../lib/prisma'
import { requireAuth } from '../../middlewares/auth.middleware'
import type { Context } from '../resolvers'

export const authResolver = {
  Query: {
    me: async (_: unknown, __: unknown, { userId }: Context) => {
      const id = requireAuth(userId)
      const user = await prisma.user.findUnique({ where: { id } })
      if (!user) throw new GraphQLError('User not found', { extensions: { code: 'NOT_FOUND' } })
      return user
    },
  },
  Mutation: {
    register: async (_: unknown, { name, email, password }: { name: string; email: string; password: string }) => {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        throw new GraphQLError('Email already in use', { extensions: { code: 'BAD_USER_INPUT' } })
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
      })

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })
      return { token, user }
    },

    login: async (_: unknown, { email, password }: { email: string; password: string }) => {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        throw new GraphQLError('Invalid credentials', { extensions: { code: 'UNAUTHENTICATED' } })
      }

      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        throw new GraphQLError('Invalid credentials', { extensions: { code: 'UNAUTHENTICATED' } })
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })
      return { token, user }
    },
  },
}
