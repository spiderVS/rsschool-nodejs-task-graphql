import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql } from 'graphql';
import { gqlSchema } from './graphql-schema';
import { graphqlBodySchema } from './schema';
import { createLoaders } from './types/dataloaders/load';
import { depthLimiteValidate } from './validators/depthLimit';

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

      const depthLimitError = depthLimiteValidate(query!, gqlSchema, 6);

      if (depthLimitError) {
        return {
          errors: [
            {
              message: depthLimitError.message,
              locations: depthLimitError.locations,
            },
          ],
        }
      }

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
