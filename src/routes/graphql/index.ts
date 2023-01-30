import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql } from 'graphql';
import { gqlSchema } from './graphql-schema';
import { graphqlBodySchema } from './schema';
import { createLoaders } from './types/dataloaders/load';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {

  const postsLoader = await createLoaders(fastify);

  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const { body: { query, variables } } = request;

      return await graphql({
        schema: gqlSchema,
        source: query!,
        contextValue: {
          fastify,
          postsLoader,
        },
        variableValues: variables,
      });
    }
  );
};

export default plugin;
