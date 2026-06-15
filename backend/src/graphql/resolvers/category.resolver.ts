import { GraphQLError } from 'graphql'
import prisma from '../../lib/prisma'
import { requireAuth } from '../../middlewares/auth.middleware'
import type { Context } from '../resolvers'

interface CreateCategoryInput {
  name: string
  description?: string
  icon?: string
  color?: string
}

interface UpdateCategoryInput {
  id: string
  name?: string
  description?: string
  icon?: string
  color?: string
}

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
    createCategory: async (_: unknown, { name, description, icon, color }: CreateCategoryInput, { userId }: Context) => {
      const id = requireAuth(userId)
      return prisma.category.create({
        data: {
          name,
          description,
          icon: icon ?? 'tag',
          color: color ?? '#16A34A',
          userId: id,
        },
      })
    },

    updateCategory: async (_: unknown, { id, name, description, icon, color }: UpdateCategoryInput, { userId }: Context) => {
      const authId = requireAuth(userId)
      const category = await prisma.category.findUnique({ where: { id } })

      if (!category || category.userId !== authId) {
        throw new GraphQLError('Category not found', { extensions: { code: 'NOT_FOUND' } })
      }

      return prisma.category.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(icon !== undefined && { icon }),
          ...(color !== undefined && { color }),
        },
      })
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
