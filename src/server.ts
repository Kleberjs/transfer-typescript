import dotenv from 'dotenv'
import Fastify from 'fastify'

import { user } from './routes/user'

dotenv.config()
const port = Number(process.env.PORT) || 3000;

const fastify = Fastify({
  logger: true
})

fastify.register(user);


fastify.listen({ port }, function(err, address) {
  if(err) {
    fastify.log.error(err);
    process.exit(1);
  }
})