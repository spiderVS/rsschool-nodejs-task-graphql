import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql } from 'graphql';
import { gqlSchema } from './graphql-schema';
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
      const { body: { query, variables } } = request;

      return await graphql({
        schema: gqlSchema,
        source: query!,
        contextValue: fastify,
        variableValues: variables,
      });
    }
  );
};

export default plugin;
