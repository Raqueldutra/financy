import { gql } from '@apollo/client'

export const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      createdAt
    }
  }
`

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      description
      icon
      color
      createdAt
      updatedAt
    }
  }
`

export const GET_TRANSACTIONS = gql`
  query GetTransactions($type: TransactionType, $categoryId: ID) {
    transactions(type: $type, categoryId: $categoryId) {
      id
      title
      amount
      type
      category {
        id
        name
        description
        icon
        color
      }
      date
      createdAt
      updatedAt
    }
  }
`
