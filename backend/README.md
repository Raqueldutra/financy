# Financy — Back-end

API GraphQL para gerenciamento de finanças pessoais.

## Tecnologias

- **TypeScript**
- **Node.js** com Express
- **GraphQL** via Apollo Server v4
- **Prisma ORM**
- **SQLite**
- **JWT** para autenticação
- **bcryptjs** para hash de senhas

## Checklist de Requisitos

### [Back-end]

- [x] O usuário pode criar uma conta e fazer login
- [x] O usuário pode ver e gerenciar apenas as transações e categorias criadas por ele
- [x] Deve ser possível criar uma transação
- [x] Deve ser possível deletar uma transação
- [x] Deve ser possível editar uma transação
- [x] Deve ser possível listar todas as transações
- [x] Deve ser possível criar uma categoria
- [x] Deve ser possível deletar uma categoria
- [x] Deve ser possível editar uma categoria
- [x] Deve ser possível listar todas as categorias

### Requisitos Não Funcionais

- [x] TypeScript
- [x] GraphQL
- [x] Prisma
- [x] SQLite
- [x] CORS habilitado
- [x] Arquivo `.env.example` com as chaves necessárias (`JWT_SECRET`, `DATABASE_URL`)

## Variáveis de Ambiente

Copie o arquivo `.env.example` e preencha os valores:

```bash
cp .env.example .env
```

| Variável       | Descrição                                      |
|----------------|------------------------------------------------|
| `JWT_SECRET`   | Chave secreta para assinar os tokens JWT       |
| `DATABASE_URL` | URL do banco SQLite (ex: `file:./dev.db`)      |
| `PORT`         | Porta do servidor (padrão: `4000`)             |
| `FRONTEND_URL` | Origem permitida pelo CORS (padrão: `*`)       |

## Instalação e execução

```bash
# Instalar dependências
npm install

# Criar o banco de dados e rodar as migrations
npm run db:migrate

# Iniciar em modo desenvolvimento
npm run dev
```

O servidor estará disponível em: `http://localhost:4000/graphql`

## Estrutura do projeto

```
backend/
├── prisma/
│   ├── schema.prisma       # Modelos: User, Category, Transaction
│   └── migrations/
├── src/
│   ├── graphql/
│   │   ├── schema/
│   │   │   └── typeDefs.ts
│   │   └── resolvers/
│   │       ├── index.ts
│   │       ├── auth.resolver.ts
│   │       ├── category.resolver.ts
│   │       └── transaction.resolver.ts
│   ├── lib/
│   │   └── prisma.ts
│   ├── middlewares/
│   │   └── auth.middleware.ts
│   └── index.ts
├── .env.example
└── tsconfig.json
```

## API GraphQL

### Mutations de autenticação

```graphql
# Criar conta
mutation {
  register(name: "João", email: "joao@email.com", password: "123456") {
    token
    user { id name email }
  }
}

# Login
mutation {
  login(email: "joao@email.com", password: "123456") {
    token
    user { id name email }
  }
}
```

> As demais operações exigem o header: `Authorization: Bearer <token>`

### Categorias

```graphql
query { categories { id name } }

mutation { createCategory(name: "Alimentação") { id name } }

mutation { updateCategory(id: "...", name: "Mercado") { id name } }

mutation { deleteCategory(id: "...") }
```

### Transações

```graphql
query { transactions { id title amount type date category { name } } }

# Filtros opcionais
query { transactions(type: EXPENSE, categoryId: "...") { id title amount } }

mutation {
  createTransaction(
    title: "Salário"
    amount: 5000
    type: INCOME
    date: "2026-06-01"
  ) { id title amount type }
}

mutation {
  updateTransaction(id: "...", amount: 5500) { id title amount }
}

mutation { deleteTransaction(id: "...") }
```
