import bcrypt from 'bcrypt'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError, z } from 'zod'
import { fromZodError  } from 'zod-validation-error'
import { prisma } from '../lib/prisma'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

type RequestBodyPost = FastifyRequest<{
  Body: {
    fullname: string,
    documentNumber: string,
    email: string,
    password: string,
    confirmPassword: string
  }
}>

export async function user(fastify: FastifyInstance ) {

  fastify.post('/user', async (request: RequestBodyPost, reply: FastifyReply) => {

    const UserSchema = z.object({
      fullname: z.string(),
      documentNumber: z.string().min(11).max(14),
      email: z.string().email(),
      password: z.string().min(8),
      confirmPassword: z.string().min(8)
    }).refine(data => data.password === data.confirmPassword, {
      message: "password don't match",
      path: ['confirmPassword']
    })
 
    try {
      const {
        fullname, 
        documentNumber,
        email,
        password
      } = UserSchema.parse(request.body)
      
      const saltRounds  = 10
      const passwordHashed = await bcrypt.hash(password, saltRounds)

      await prisma.user.create({
        data: {
          fullname, 
          documentNumber,
          email,
          password: passwordHashed
        }
      })

      return reply.status(201).send()

    } catch (err) {
      if (err instanceof ZodError) {
        const errorFromZod = fromZodError(err);
        return reply.status(400).send(errorFromZod);
      } else if( err instanceof PrismaClientKnownRequestError) {
        if(err.code === 'P2002') {
          return reply.status(409).send('There is a unique constraint violation')
        }
      }

      return reply.send(err);
    }
  })
  
  fastify.get('/user', async (request, reply) => {
    const users = await prisma.user.findMany()

    return reply.send(users);
  })

  fastify.get('/user/:id', (request, reply) => {
    
  })


  fastify.put('/user/:id', (request, reply) => {
    
  })

  fastify.delete('/user/:id', (request, reply) => {
    
  })
}