import bcrypt from 'bcrypt'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError, z } from 'zod'
import { fromZodError  } from 'zod-validation-error'
import { prisma } from '../lib/prisma'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

    // antes adicionar validação de token
    // antes adicionar adicionar validação de core

type RequestBodyPost = FastifyRequest<{
  Body: {
    fullname: string,
    documentNumber: string,
    email: string,
    password: string,
    confirmPassword: string
  }
}>

type RequestBodyPut = FastifyRequest<{
  Body: {
    fullname: string,
    documentNumber: string,
    email: string,
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
  
  fastify.get('/user', async (request, reply: FastifyReply) => {

    // receber limite no queryString e limitar/padronizar a 1000
    // receber campo de ordernação no queryString e padronizar por id
    // receber tipo de ordenação no queryString e padronizar por ASC

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

  fastify.get('/user/:id', async (request, reply: FastifyReply) => {
    const UserSquema = z.object({
      id: z.coerce.number()
    });

    try {
      const { id } = UserSquema.parse(request.params)

      const user = await prisma.user.findFirst({
        where: { id }
      });

      if (!user) return reply.status(400).send('User not found')

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

  fastify.put('/user/:id', async (request: RequestBodyPut, reply: FastifyReply) => {
    const UserSchemaParams = z.object({
      id: z.coerce.number()
    })

    const UserSchemaBody = z.object({
      fullname: z.string(),
      documentNumber: z.string().min(11).max(14),
      email: z.string().email()
    })

    try {
      const { id } = UserSchemaParams.parse(request.params)
      const {
        fullname,
        documentNumber,
        email
      } = UserSchemaBody.parse(request.body);

      const user = await prisma.user.findFirst({
        where: { id }
      })

      if (!user) return reply.status(400).send('User not found')

      await prisma.user.update({
        where: { id },
        data: {
          fullname,
          documentNumber,
          email
        }
      })

      return reply.status(204).send()

    } catch (err) {
      if(err instanceof ZodError) {
        const errorFromZod = fromZodError(err)
        return reply.status(400).send(errorFromZod)
      }

      return reply.send(err);
    }

    

  })

  fastify.put('/user/password/:id', async (request, reply) => {
    const UserSchemaParams = z.object({
      id: z.coerce.number()
    })

    const UserSchemaBody = z.object({
      passwordOld: z.string().min(8),
      newPassword: z.string().min(8),
      confirmNewPassword: z.string().min(8)
    }).refine(data => data.newPassword === data.confirmNewPassword, {
      message: "password don't match",
      path: ['confirmNewPassword']
    })

    try {
      const { id } = UserSchemaParams.parse(request.params)
      const {
        passwordOld,
        newPassword
      } = UserSchemaBody.parse(request.body)


    const user = await prisma.user.findFirst({
      where: { id }
    })

    if (!user) return reply.status(400).send('User not found')

    const isOldPassword = await bcrypt.compare(passwordOld, user.password)

    if (!isOldPassword) return reply.status(401).send('Old password is incorrect')

    const isSamePasswordBefore = await bcrypt.compare(newPassword, user.password)

    if (isSamePasswordBefore) return reply.status(400).send('You are using the same password as before')

    const saltRounds = 10
    const password = await bcrypt.hash(newPassword, saltRounds)

    await prisma.user.update({
      where: { id },
      data: {
        password
      }
    })

    return reply.status(201).send()

    } catch (err) {
      if (err instanceof ZodError) {
        const errorFromZod = fromZodError(err)
        return reply.status(400).send(errorFromZod)
      }

      return reply.send(err)
    }

    


  })

  fastify.delete('/user/:id', (request, reply) => {
    
  })
}