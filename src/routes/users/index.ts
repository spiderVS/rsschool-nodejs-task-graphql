import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createUserBodySchema, changeUserBodySchema, subscribeBodySchema } from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';
import { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (fastify): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    const users = await fastify.db.users.findMany();
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
        return user;
      } else {
        throw fastify.httpErrors.notFound();
      }
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
      try {
        const deletedUser = await fastify.db.users.delete(id);

        // Delete relations into subscribedToUserIds
        const usersWithSubscribes = await fastify.db.users.findMany({ key: 'subscribedToUserIds', inArray: id });
        const updatedUsersWithSubscribes = usersWithSubscribes.map((user: UserEntity) => {
          const idx = user.subscribedToUserIds.indexOf(id);
          user.subscribedToUserIds.splice(idx, 1);
          return { ...user, subscribedToUserIds: user.subscribedToUserIds };
        });
        updatedUsersWithSubscribes.forEach(async (user: UserEntity, idx) => {
          await fastify.db.users.change(user.id, updatedUsersWithSubscribes[idx]);
        });

        // Delete related posts created by deleted user
        const postsOfDeletedUser = await fastify.db.posts.findMany({ key: 'userId', equals: id });
        postsOfDeletedUser.forEach(async (post: PostEntity) => {
          await fastify.db.posts.delete(post.id);
        });

        // Delete related profiles by deleted user
        const profileOfDeletedUser = await fastify.db.profiles.findOne({ key: 'userId', equals: id });
        if (profileOfDeletedUser) {
          await fastify.db.profiles.delete(profileOfDeletedUser.id);
        }

        return deletedUser;
      } catch {
        throw fastify.httpErrors.badRequest();
      }
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
        return updatedUser;
      } else {
        throw fastify.httpErrors.badRequest();
      }
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
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
        const idx = updatedUser?.subscribedToUserIds.indexOf(id);
        if (idx !== -1) {
          updatedUser.subscribedToUserIds.splice(idx, 1);
          await fastify.db.users.change(userId, updatedUser);
        } else {
          throw fastify.httpErrors.badRequest();
        }
        return updatedUser;
      } else {
        throw fastify.httpErrors.badRequest();
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params;
      const { body } = request;
      const user = await fastify.db.users.findOne({ key: 'id', equals: id });
      if (user) {
        const changedUser = await fastify.db.users.change(id, body);
        return changedUser;
      } else {
        throw fastify.httpErrors.badRequest();
      }
    }
  );
};

export default plugin;
