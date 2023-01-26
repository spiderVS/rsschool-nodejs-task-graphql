import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql } from 'graphql';
import { gqlSchema } from './gqlSchema';
import { graphqlBodySchema } from './schema';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const { query } = request.body;
      return await graphql({
        schema: gqlSchema,
        source: String(query),
        contextValue: fastify,
      });
    }
  );
};

export default plugin;
