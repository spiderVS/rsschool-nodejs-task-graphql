import { FastifyInstance } from 'fastify';
import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UserEntity } from '../../../../utils/DB/entities/DBUsers';

import * as DataLoader from 'dataloader';

const UserType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: { type: new GraphQLList(GraphQLID) },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (
        source: UserEntity,
        args: unknown,
        {
          fastify,
          postsDataloader,
          profilesDataloader
        }: {
          fastify: FastifyInstance;
          postsDataloader: DataLoader<any, any, any>;
          profilesDataloader: DataLoader<any, any, any>;
        }
      ) => {
        const { id } = source;
        const userPosts = await postsDataloader.load(id);
        return userPosts;
      },
    },
    profile: {
      type: ProfileType,
      resolve: async (
        source: UserEntity,
        args: unknown,
        {
          fastify,
          postsDataloader,
          profilesDataloader,
        }: {
          fastify: FastifyInstance;
          postsDataloader: DataLoader<any, any, any>;
          profilesDataloader: DataLoader<any, any, any>;
        }
      ) => {
        const { id } = source;
        const userProfile = await profilesDataloader.load(id);
        if (!userProfile) {
          throw new Error(`Profile of user id ${id} not found`);
        }
        return userProfile;
      },
    },
    memberType: {
      type: TypeOfMemberType,
      resolve: async (source: UserEntity, args: unknown, { fastify }: { fastify: FastifyInstance }) => {
        const { id } = source;
        const userProfile = await fastify.db.profiles.findOne({ key: 'userId', equals: id });
        if (!userProfile) {
          throw new Error(`Profile of user id ${id} not found`);
        }
        const { memberTypeId } = userProfile;
        const userMemberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: memberTypeId });
        if (!userMemberType) {
          throw new Error(`MemberType of user id ${id} not found`);
        }
        return userMemberType;
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (source: UserEntity, args: unknown, { fastify }: { fastify: FastifyInstance }) => {
        const { id } = source;
        return await fastify.db.users.findMany({ key: 'subscribedToUserIds', inArray: id });
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (source: UserEntity, args: unknown, { fastify }: { fastify: FastifyInstance }) => {
        const { subscribedToUserIds } = source;
        return await fastify.db.users.findMany({ key: 'id', equalsAnyOf: subscribedToUserIds });
      },
    },
  }),
});

const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    userId: { type: new GraphQLNonNull(GraphQLID) },
  }),
});

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type: GraphQLFloat },
    country: { type: GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    memberTypeId: { type: GraphQLString },
    userId: { type: new GraphQLNonNull(GraphQLID) },
  }),
});

const TypeOfMemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: GraphQLString },
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt },
  }),
});

export { UserType, PostType, ProfileType, TypeOfMemberType };
