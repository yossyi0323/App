import 'dotenv/config';
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { trpcServer } from '@hono/trpc-server'
import { appRouter } from './routers/index.js'
export type { AppRouter } from './routers/index.js'

const app = new Hono()

app.use('/*', cors())

import { defineAbilitiesFor } from './utils/casl.js'

const createContext = async () => {
  // Mock User Role for now
  const role = 'ADMIN';
  const ability = await defineAbilitiesFor(role);
  return {
    ability,
  };
}

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext,
  })
)

app.get('/', (c) => {
  return c.text('Lego Architecture App API')
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
