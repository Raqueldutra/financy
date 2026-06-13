import 'dotenv/config'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import express from 'express'
import http from 'http'
import cors from 'cors'
import { json } from 'body-parser'
import { typeDefs } from './graphql/schema/typeDefs'
import { resolvers, type Context } from './graphql/resolvers'
import { getUserFromToken } from './middlewares/auth.middleware'

async function main() {
  const app = express()
  const httpServer = http.createServer(app)

  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  })

  await server.start()

  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: process.env.FRONTEND_URL || '*',
      credentials: true,
    }),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
        const userId = token ? getUserFromToken(token) : undefined
        return { userId }
      },
    })
  )

  const PORT = Number(process.env.PORT) || 4000

  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve))
  console.log(`Server ready at http://localhost:${PORT}/graphql`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
