import { FastifyInstance } from 'fastify';
import { GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { PostType, ProfileType, TypeOfMemberType, UserType } from '../base-entity-types/base-entity-types';

type Id = {
  [key: string]: string;
};

export const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    users: {
      type: new GraphQLList(UserType),
      resolve: async (_source: unknown, _args: unknown, { fastify }: { fastify: FastifyInstance}) => {
        return await fastify.db.users.findMany();
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (_source: unknown, _args: unknown, { fastify }: { fastify: FastifyInstance}) => {
        return await fastify.db.posts.findMany();
      },
    },
    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: async (_source: unknown, _args: unknown, { fastify }: { fastify: FastifyInstance}) => {
        return await fastify.db.profiles.findMany();
      },
    },
    memberTypes: {
      type: new GraphQLList(TypeOfMemberType),
      resolve: async (_source: unknown, _args: unknown, { fastify }: { fastify: FastifyInstance}) => {
        return await fastify.db.memberTypes.findMany();
      },
    },

    // -----------------------

    user: {
      type: UserType,
      args: {
        id: {
          description: 'Id of the user',
          type: GraphQLID,
        },
      },
      resolve: async (_source: unknown, { id }: Id, { fastify }: { fastify: FastifyInstance}) => {
        const user = await fastify.db.users.findOne({ key: 'id', equals: id });
        if (!user) throw new Error(`User with id ${id} not found`);
        return user;
      },
    },
    post: {
      type: PostType,
      args: {
        id: {
          description: 'Id of the post',
          type: GraphQLID,
        },
      },
      resolve: async (_source: unknown, { id }: Id, { fastify }: { fastify: FastifyInstance}) => {
        const post = await fastify.db.posts.findOne({ key: 'id', equals: id });
        if (!post) throw new Error(`Post with id ${id} not found`);
        return post;
      },
    },
    profile: {
      type: ProfileType,
      args: {
        id: {
          description: 'Id of the profile',
          type: GraphQLID,
        },
      },
      resolve: async (_source: unknown, { id }: Id, { fastify }: { fastify: FastifyInstance}) => {

        const porfile = await fastify.db.profiles.findOne({ key: 'id', equals: id });
        if (!porfile) throw new Error(`Porfile with id ${id} not found`);
        return porfile;
      },
    },
    memberType: {
      type: TypeOfMemberType,
      args: {
        id: {
          description: 'Id of the memberType',
          type: GraphQLString,
        },
      },
      resolve: async (_source: unknown, { id }: Id, { fastify }: { fastify: FastifyInstance}) => {
        const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: id });
        if (!memberType) throw new Error(`MemberType with id ${id} not found`);
        return memberType;
      },
    },
  }),
});
