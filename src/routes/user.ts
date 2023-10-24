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
    // antes adicionar validação de token
    // antes adicionar adicionar validação de core

    const UserSchema = z.object({
      page: z.coerce.number().optional()
    })

    try {
      const { page } = UserSchema.parse(request.query)

      const take = 2
      const pagination = page ?? 1
      const skip = (pagination - 1) * take
  
      const users = await prisma.user.findMany({
        skip,
        take
      })
  
      const result = users.map(u => ({
        fullname: u?.fullname,
        email: u?.email,
        documentNumber: u?.documentNumber
      }))
  
      return reply.send(result)
      
    } catch (err) {
      if (err instanceof ZodError) {
        const errorFromZod = fromZodError(err)
        return reply.status(400).send(errorFromZod)
      }

      return reply.send(err)
    }
  })

  fastify.get('/user/:id', async (request, reply) => {
    const UserSquema = z.object({
      id: z.coerce.number()
    });

    try {
      const { id } = UserSquema.parse(request.params)

      const user = await prisma.user.findFirst({
        where: { id }
      });

      const result = {
        fullname: user?.fullname,
        email: user?.email,
        documentNumber: user?.documentNumber 
      }
      return reply.send(result)

    } catch (err) {
      if(err instanceof ZodError) {
        const errorFromZod = fromZodError(err)
        return reply.status(400).send(errorFromZod)
      }

      return reply.send(err)
    }
    
  })


  fastify.put('/user/:id', (request, reply) => {
    
  })

  fastify.delete('/user/:id', (request, reply) => {
    
  })
}