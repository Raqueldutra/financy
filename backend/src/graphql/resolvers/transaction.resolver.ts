import { GraphQLError } from 'graphql'
import prisma from '../../lib/prisma'
import { requireAuth } from '../../middlewares/auth.middleware'
import type { Context } from '../resolvers'

interface TransactionFilters {
  type?: 'INCOME' | 'EXPENSE'
  categoryId?: string
}

interface CreateTransactionInput {
  title: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  categoryId?: string
  date: string
}

interface UpdateTransactionInput {
  id: string
  title?: string
  amount?: number
  type?: 'INCOME' | 'EXPENSE'
  categoryId?: string
  date?: string
}

export const transactionResolver = {
  Query: {
    transactions: async (_: unknown, { type, categoryId }: TransactionFilters, { userId }: Context) => {
      const id = requireAuth(userId)
      return prisma.transaction.findMany({
        where: {
          userId: id,
          ...(type && { type }),
          ...(categoryId && { categoryId }),
        },
        include: { category: true },
        orderBy: { date: 'desc' },
      })
    },
  },
  Mutation: {
    createTransaction: async (_: unknown, input: CreateTransactionInput, { userId }: Context) => {
      const id = requireAuth(userId)

      if (input.categoryId) {
        const category = await prisma.category.findUnique({ where: { id: input.categoryId } })
        if (!category || category.userId !== id) {
          throw new GraphQLError('Category not found', { extensions: { code: 'NOT_FOUND' } })
        }
      }

      return prisma.transaction.create({
        data: {
          title: input.title,
          amount: input.amount,
          type: input.type,
          categoryId: input.categoryId,
          userId: id,
          date: new Date(input.date),
        },
        include: { category: true },
      })
    },

    updateTransaction: async (_: unknown, { id, ...data }: UpdateTransactionInput, { userId }: Context) => {
      const authId = requireAuth(userId)
      const transaction = await prisma.transaction.findUnique({ where: { id } })

      if (!transaction || transaction.userId !== authId) {
        throw new GraphQLError('Transaction not found', { extensions: { code: 'NOT_FOUND' } })
      }

      if (data.categoryId) {
        const category = await prisma.category.findUnique({ where: { id: data.categoryId } })
        if (!category || category.userId !== authId) {
          throw new GraphQLError('Category not found', { extensions: { code: 'NOT_FOUND' } })
        }
      }

      return prisma.transaction.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.amount !== undefined && { amount: data.amount }),
          ...(data.type !== undefined && { type: data.type }),
          ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
          ...(data.date !== undefined && { date: new Date(data.date) }),
        },
        include: { category: true },
      })
    },

    deleteTransaction: async (_: unknown, { id }: { id: string }, { userId }: Context) => {
      const authId = requireAuth(userId)
      const transaction = await prisma.transaction.findUnique({ where: { id } })

      if (!transaction || transaction.userId !== authId) {
        throw new GraphQLError('Transaction not found', { extensions: { code: 'NOT_FOUND' } })
      }

      await prisma.transaction.delete({ where: { id } })
      return true
    },
  },
}
