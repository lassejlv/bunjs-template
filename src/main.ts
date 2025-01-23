import { Logger, Router } from 'bun-easy-router'
import consola from 'consola'

const server = Bun.serve({
  port: Bun.env.PORT || 3000,
  fetch: async (req) => {
    const router = Router(req)

    router.use(Logger())

    router.get('/', (c) => c.text('Hello mom!'))

    return router.run()
  },
})

consola.success(`Listening on ${server.url}`)
