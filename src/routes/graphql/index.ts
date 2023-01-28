import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { buildSchema, graphql } from 'graphql';
import { UserEntity } from '../../utils/DB/entities/DBUsers';
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
      // console.log('🚀 query:', query);
      // console.log('🚀 variables:', variables);

      const DBUsers = fastify.db.users;
      const DBPosts = fastify.db.posts;
      const DBProfiles = fastify.db.profiles;
      const DBMemberTypes = fastify.db.memberTypes;

      type Id = {
        [key: string]: string;
      };

      type CreateUserDTO = Omit<UserEntity, 'id' | 'subscribedToUserIds'>;
      type ChangeUserDTO = Partial<Omit<UserEntity, 'id'>>;

      const resolvers = {
        users: async () => await DBUsers.findMany(),
        posts: async () => await DBPosts.findMany(),
        profiles: async () => await DBProfiles.findMany(),
        memberTypes: async () => await DBMemberTypes.findMany(),

        user: async ({ id }: Id) => await DBUsers.findOne({ key: 'id', equals: id }),
        post: async ({ id }: Id) => await DBPosts.findOne({ key: 'id', equals: id }),
        profile: async ({ id }: Id) => await DBProfiles.findOne({ key: 'id', equals: id }),
        memberType: async ({ id }: Id) => await DBMemberTypes.findOne({ key: 'id', equals: id }),

        userCreate: async ({ input }: { input: CreateUserDTO }) => {
          console.log('🚀 input:', input);
          return { user: await DBUsers.create(input) };
        },
        userUpdate: async ({ id, input }: { id: string, input: ChangeUserDTO }) => {
          const user = await DBUsers.findOne({ key: 'id', equals: id });
          if (user) {
            return { user: await DBUsers.change(id, input)};
          } else {
            throw fastify.httpErrors.badRequest();
          }
        }
      };

      const typeDefs = /* GraphQL */ `
        type Query {
          users: [User]!
          posts: [Post]!
          profiles: [Profile]!
          memberTypes: [MemberType]!
          user(id: ID!): User
          post(id: ID!): Post
          profile(id: ID!): Profile
          memberType(id: String!): MemberType
        }

        type Mutation {
          userCreate(input: UserCreateInput!): UserPayload
          userUpdate(id: ID!, input: UserUpdateInput!): UserPayload
        }

        type User {
          id: ID!
          firstName: String!
          lastName: String!
          email: String!
          subscribedToUserIds: [ID]!
        }

        input UserCreateInput {
          firstName: String!
          lastName: String!
          email: String!
        }

        input UserUpdateInput {
          firstName: String
          lastName: String
          email: String
        }

        type UserPayload {
          user: User
        }

        type Post {
          id: ID!
          title: String!
          content: String!
          userId: ID!
        }

        type Profile {
          id: ID!
          avatar: String!
          sex: String!
          birthday: Float!
          country: String!
          street: String!
          city: String!
          memberTypeId: String!
          userId: ID!
        }

        type MemberType {
          id: String!
          discount: Int!
          monthPostsLimit: Int!
        }
      `;

      const schema = buildSchema(typeDefs);

      return await graphql({
        schema,
        source: String(query),
        // contextValue: fastify,
        rootValue: resolvers,
        variableValues: variables,
      });
    }
  );
};

export default plugin;
