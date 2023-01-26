import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (fastify): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    const posts = await fastify.db.posts.findMany();
    return posts;
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const { id } = request.params;
      const post = await fastify.db.posts.findOne({ key: 'id', equals: id });
      if (post) {
        return post;
      } else {
        throw fastify.httpErrors.notFound();
      }
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const { body } = request;
      const { userId } = body;
      const isUserExist = !!(await fastify.db.users.findOne({ key: 'id', equals: userId }));
      if (isUserExist) {
        const createdPost = await fastify.db.posts.create(body);
        return createdPost;
      } else {
        throw fastify.httpErrors.badRequest();
      }
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const { id } = request.params;
      try {
        const deletedPost = await fastify.db.posts.delete(id);
        return deletedPost;
      } catch {
        throw fastify.httpErrors.badRequest();
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const { id } = request.params;
      const { body } = request;
      const user = await fastify.db.posts.findOne({ key: 'id', equals: id });
      if (user) {
        const changedPost = await fastify.db.posts.change(id, body);
        return changedPost;
      } else {
        throw fastify.httpErrors.badRequest();
      }
    }
  );
};

export default plugin;
