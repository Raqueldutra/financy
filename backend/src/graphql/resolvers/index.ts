import { authResolver } from './auth.resolver'
import { categoryResolver } from './category.resolver'
import { transactionResolver } from './transaction.resolver'

export interface Context {
  userId?: string
}

export const resolvers = {
  Query: {
    ...authResolver.Query,
    ...categoryResolver.Query,
    ...transactionResolver.Query,
  },
  Mutation: {
    ...authResolver.Mutation,
    ...categoryResolver.Mutation,
    ...transactionResolver.Mutation,
  },
}
