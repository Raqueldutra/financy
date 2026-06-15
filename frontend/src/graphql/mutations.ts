import { gql } from '@apollo/client'

export const REGISTER = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      token
      user {
        id
        name
        email
        createdAt
      }
    }
  }
`

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        createdAt
      }
    }
  }
`

export const UPDATE_USER = gql`
  mutation UpdateUser($name: String!) {
    updateUser(name: $name) {
      id
      name
      email
      createdAt
    }
  }
`

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($name: String!, $description: String, $icon: String, $color: String) {
    createCategory(name: $name, description: $description, icon: $icon, color: $color) {
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

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $name: String, $description: String, $icon: String, $color: String) {
    updateCategory(id: $id, name: $name, description: $description, icon: $icon, color: $color) {
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

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`

export const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($title: String!, $amount: Float!, $type: TransactionType!, $categoryId: ID, $date: String!) {
    createTransaction(title: $title, amount: $amount, type: $type, categoryId: $categoryId, date: $date) {
      id
      title
      amount
      type
      category {
        id
        name
        icon
        color
      }
      date
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_TRANSACTION = gql`
  mutation UpdateTransaction($id: ID!, $title: String, $amount: Float, $type: TransactionType, $categoryId: ID, $date: String) {
    updateTransaction(id: $id, title: $title, amount: $amount, type: $type, categoryId: $categoryId, date: $date) {
      id
      title
      amount
      type
      category {
        id
        name
        icon
        color
      }
      date
      createdAt
      updatedAt
    }
  }
`

export const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`
