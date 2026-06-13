import { GraphQLError } from 'graphql'
import prisma from '../../lib/prisma'
import { requireAuth } from '../../middlewares/auth.middleware'
import type { Context } from '../resolvers'

export const categoryResolver = {
  Query: {
    categories: async (_: unknown, __: unknown, { userId }: Context) => {
      const id = requireAuth(userId)
      return prisma.category.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
      })
    },
  },
  Mutation: {
    createCategory: async (_: unknown, { name }: { name: string }, { userId }: Context) => {
      const id = requireAuth(userId)
      return prisma.category.create({ data: { name, userId: id } })
    },

    updateCategory: async (_: unknown, { id, name }: { id: string; name: string }, { userId }: Context) => {
      const authId = requireAuth(userId)
      const category = await prisma.category.findUnique({ where: { id } })

      if (!category || category.userId !== authId) {
        throw new GraphQLError('Category not found', { extensions: { code: 'NOT_FOUND' } })
      }

      return prisma.category.update({ where: { id }, data: { name } })
    },

    deleteCategory: async (_: unknown, { id }: { id: string }, { userId }: Context) => {
      const authId = requireAuth(userId)
      const category = await prisma.category.findUnique({ where: { id } })

      if (!category || category.userId !== authId) {
        throw new GraphQLError('Category not found', { extensions: { code: 'NOT_FOUND' } })
      }

      await prisma.category.delete({ where: { id } })
      return true
    },
  },
}
