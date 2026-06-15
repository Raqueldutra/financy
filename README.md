# Financy

Sistema para gerenciamento de finanças pessoais.

## Tecnologias

- **TypeScript**
- **Node.js** com Express
- **GraphQL** via Apollo Server v4
- **Prisma ORM**
- **SQLite**
- **JWT** para autenticação
- **bcryptjs** para hash de senhas

## Checklist de Requisitos

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

## Instalação e execução backend

```bash
# Instalar dependências
cd backend/
npm install

# Criar o banco de dados e rodar as migrations
npm run db:migrate

# Iniciar em modo desenvolvimento
npm run dev
```

O servidor estará disponível em: `http://localhost:4000/graphql`

## Instalação e execução frontend

```bash
# Instalar dependências
cd frontend/
npm install

# Iniciar em modo desenvolvimento
npm run dev
```

O servidor estará disponível em: `http://localhost:3000/`
