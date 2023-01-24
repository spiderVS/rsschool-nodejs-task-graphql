import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  // changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    const users = await fastify.db.users.findMany();
    reply.send(users);
    return users;
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params;
      const user = await fastify.db.users.findOne({ key: 'id', equals: id });
      if (user) {
        reply.send(user);
      } else {
        reply.code(404).send({});
      }
      return user ?? {} as UserEntity;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const createdUser = await fastify.db.users.create(request.body);
      reply.send(createdUser);
      return createdUser;
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params;
      let deletedUser: UserEntity | null = null;
      try {
        deletedUser = await fastify.db.users.delete(id);
        reply.send(deletedUser);
      } catch (err) {
        if (err instanceof Error) {
          reply.code(400).send({ error: err.name });
        }
      }
      return deletedUser ?? {} as UserEntity;
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { userId } = request.body;
      const { id } = request.params;

      const updatedUser = await fastify.db.users.findOne({ key: 'id', equals: userId });
      if (updatedUser) {
        updatedUser?.subscribedToUserIds.push(id);
        await fastify.db.users.change(userId, updatedUser);
        reply.send(updatedUser);
      } else {
        reply.code(400).send({});
      }

      return updatedUser ?? {} as UserEntity;
    }
  );

  // fastify.post(
  //   '/:id/unsubscribeFrom',
  //   {
  //     schema: {
  //       body: subscribeBodySchema,
  //       params: idParamSchema,
  //     },
  //   },
  //   async function (request, reply): Promise<UserEntity> {}
  // );

  // fastify.patch(
  //   '/:id',
  //   {
  //     schema: {
  //       body: changeUserBodySchema,
  //       params: idParamSchema,
  //     },
  //   },
  //   async function (request, reply): Promise<UserEntity> {}
  // );
};

export default plugin;
