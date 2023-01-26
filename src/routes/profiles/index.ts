import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (fastify): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<ProfileEntity[]> {
    const profiles = await fastify.db.profiles.findMany();
    return profiles;
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const { id } = request.params;
      const profile = await fastify.db.profiles.findOne({ key: 'id', equals: id });
      if (profile) {
        return profile;
      } else {
        throw fastify.httpErrors.notFound();
      }
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const { body } = request;
      const { userId } = body;
      const { memberTypeId } = body;
      const isUserExist = !!(await fastify.db.users.findOne({ key: 'id', equals: userId }));
      const isMemberTypeExist = !!(await fastify.db.memberTypes.findOne({ key: 'id', equals: memberTypeId }));

      const isUserProfileAlreadyExist = !!(await fastify.db.profiles.findOne({ key: 'userId', equals: userId }));

      if (isUserExist && isMemberTypeExist && !isUserProfileAlreadyExist) {
        const createdProfile = await fastify.db.profiles.create(body);
        return createdProfile;
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
    async function (request, reply): Promise<ProfileEntity> {
      const { id } = request.params;
      try {
        const deletedProfile = await fastify.db.profiles.delete(id);
        return deletedProfile;
      } catch {
        throw fastify.httpErrors.badRequest();
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const { id } = request.params;
      const { body } = request;
      const foundProfile = await fastify.db.profiles.findOne({ key: 'id', equals: id });
      if (foundProfile) {
        const changedProfile = await fastify.db.profiles.change(id, body);
        return changedProfile;
      } else {
        throw fastify.httpErrors.badRequest();
      }
    }
  );
};

export default plugin;
