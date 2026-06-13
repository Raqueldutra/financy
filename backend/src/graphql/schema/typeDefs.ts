export const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Category {
    id: ID!
    name: String!
    createdAt: String!
    updatedAt: String!
  }

  type Transaction {
    id: ID!
    title: String!
    amount: Float!
    type: TransactionType!
    category: Category
    date: String!
    createdAt: String!
    updatedAt: String!
  }

  enum TransactionType {
    INCOME
    EXPENSE
  }

  type Query {
    me: User!
    categories: [Category!]!
    transactions(type: TransactionType, categoryId: ID): [Transaction!]!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    createCategory(name: String!): Category!
    updateCategory(id: ID!, name: String!): Category!
    deleteCategory(id: ID!): Boolean!

    createTransaction(
      title: String!
      amount: Float!
      type: TransactionType!
      categoryId: ID
      date: String!
    ): Transaction!

    updateTransaction(
      id: ID!
      title: String
      amount: Float
      type: TransactionType
      categoryId: ID
      date: String
    ): Transaction!

    deleteTransaction(id: ID!): Boolean!
  }
`
