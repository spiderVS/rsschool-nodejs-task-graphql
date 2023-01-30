import { FastifyInstance } from "fastify";
import { GraphQLFloat, GraphQLID, GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { MemberTypeEntity } from "../../../../utils/DB/entities/DBMemberTypes";
import { PostEntity } from "../../../../utils/DB/entities/DBPosts";
import { ProfileEntity } from "../../../../utils/DB/entities/DBProfiles";
import { UserEntity } from "../../../../utils/DB/entities/DBUsers";
import { PostType, ProfileType, TypeOfMemberType, UserType } from "../base-entity-types/base-entity-types";

type CreateUserDTO = Omit<UserEntity, 'id' | 'subscribedToUserIds'>;
type ChangeUserDTO = Partial<Omit<UserEntity, 'id'>>;

type CreatePostDTO = Omit<PostEntity, 'id'>;
type ChangePostDTO = Partial<Omit<PostEntity, 'id' | 'userId'>>;

type CreateProfileDTO = Omit<ProfileEntity, 'id'>;
type ChangeProfileDTO = Partial<Omit<ProfileEntity, 'id' | 'userId'>>;

type ChangeMemberTypeDTO = Partial<Omit<MemberTypeEntity, 'id'>>;

export const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    userCreate: {
      type: UserPayloadType,
      args: {
        input: {
          type: UserCreateInputType,
        },
      },
      resolve: async (_source: unknown, { input }: { input: CreateUserDTO }, context: FastifyInstance) => ({
        user: await context.db.users.create(input),
      }),
    },
    userUpdate: {
      type: UserPayloadType,
      args: {
        id: {
          description: 'Id of the user to update',
          type: GraphQLID,
        },
        input: {
          type: UserUpdateInputType,
        },
      },
      resolve: async (
        _source: unknown,
        { id, input }: { id: string; input: ChangeUserDTO },
        context: FastifyInstance
      ) => {
        const user = await context.db.users.findOne({ key: 'id', equals: id });
        if (!user) {
          throw new Error(`User with id ${id} does not exist`);
        }
        return { user: await context.db.users.change(id, input) };
      },
    },

    postCreate: {
      type: PostPayloadType,
      args: {
        input: {
          type: PostCreateInputType,
        },
      },
      resolve: async (_source: unknown, { input }: { input: CreatePostDTO }, context: FastifyInstance) => {
        const { userId } = input;
        const isUserExist = !!(await context.db.users.findOne({ key: 'id', equals: userId }));
        if (!isUserExist) {
          throw new Error(`User with userId ${userId} does not exist`);
        }
        return { post: await context.db.posts.create(input) };
      },
    },
    postUpdate: {
      type: PostPayloadType,
      args: {
        id: {
          description: 'Id of the post to update',
          type: GraphQLID,
        },
        input: {
          type: PostUpdateInputType,
        },
      },
      resolve: async (
        _source: unknown,
        { id, input }: { id: string; input: ChangePostDTO },
        context: FastifyInstance
      ) => {
        const post = await context.db.posts.findOne({ key: 'id', equals: id });
        if (!post) {
          throw new Error(`Post with id ${id} does not exist`);
        }
        return { post: await context.db.posts.change(id, input) };
      },
    },

    profileCreate: {
      type: ProfilePayloadType,
      args: {
        input: {
          type: ProfileCreateInputType,
        },
      },
      resolve: async (_source: unknown, { input }: { input: CreateProfileDTO }, context: FastifyInstance) => {
        const { userId } = input;
        const { memberTypeId } = input;
        const isUserExist = !!(await context.db.users.findOne({ key: 'id', equals: userId }));
        const isMemberTypeExist = !!(await context.db.memberTypes.findOne({ key: 'id', equals: memberTypeId }));

        const isUserProfileAlreadyExist = !!(await context.db.profiles.findOne({ key: 'userId', equals: userId }));

        if (!isUserExist) {
          throw new Error(`User with userId ${userId} does not exist`);
        } else if (!isMemberTypeExist) {
          throw new Error(`MemberType with memberTypeId ${memberTypeId} does not exist`);
        } else if (isUserProfileAlreadyExist) {
          throw new Error(`User profile already exist`);
        }
        return { profile: await context.db.profiles.create(input) };
      },
    },
    profileUpdate: {
      type: ProfilePayloadType,
      args: {
        id: {
          description: 'Id of the profile to update',
          type: GraphQLID,
        },
        input: {
          type: ProfileUpdateInputType,
        },
      },
      resolve: async (
        _source: unknown,
        { id, input }: { id: string; input: ChangeProfileDTO },
        context: FastifyInstance
      ) => {
        const foundProfile = await context.db.profiles.findOne({ key: 'id', equals: id });
        if (!foundProfile) {
          throw new Error(`Profile with id ${id} does not exist`);
        }
        return { profile: await context.db.profiles.change(id, input) };
      },
    },

    memberTypeUpdate: {
      type: MemberTypePayloadType,
      args: {
        id: {
          description: 'Id of the memberType to update',
          type: GraphQLString,
        },
        input: {
          type: MemberTypeUpdateInputType,
        },
      },
      resolve: async (
        _source: unknown,
        { id, input }: { id: string; input: ChangeMemberTypeDTO },
        context: FastifyInstance
      ) => {
        const memberType = await context.db.memberTypes.findOne({ key: 'id', equals: id });
        if (!memberType) {
          throw new Error(`MemberType with id ${id} does not exist`);
        }
        return { memberType: await context.db.memberTypes.change(id, input) };
      },
    },

    subscribeTo: {
      type: SubscribeToPayloadType,
      args: {
        id: {
          description: 'Id of the subscribing user',
          type: GraphQLID,
        },
        input: {
          type: SubscribeTo_UnsubscribeFromType,
        },
      },
      resolve: async (
        _source: unknown,
        { id, input }: { id: string; input: { userId: string } },
        context: FastifyInstance
      ) => {
        const { userId } = input;
        const subscribeToUser = await context.db.users.findOne({ key: 'id', equals: userId });
        const subscribingUser = await context.db.users.findOne({ key: 'id', equals: id });

        if (!subscribeToUser) {
          throw new Error(`User for subscribe with id ${userId} does not exist`);
        } else if (!subscribingUser) {
          throw new Error(`Subcsribing user with id ${id} does not exist`);
        }
        const isAlreadySubscribed = subscribeToUser.subscribedToUserIds.includes(id);
        if (isAlreadySubscribed) {
          throw new Error(`User with id ${id} already subscribed`);
        }
        subscribeToUser.subscribedToUserIds.push(id);
        return { subscribeTo: await context.db.users.change(userId, subscribeToUser) };
      },
    },
    unsubscribeFrom: {
      type: UnsubscribeFromPayloadType,
      args: {
        id: {
          description: 'Id of the unsubscribing user',
          type: GraphQLID,
        },
        input: {
          type: SubscribeTo_UnsubscribeFromType,
        },
      },
      resolve: async (
        _source: unknown,
        { id, input }: { id: string; input: { userId: string } },
        context: FastifyInstance
      ) => {
        const { userId } = input;
        const unsubscribeFromUser = await context.db.users.findOne({ key: 'id', equals: userId });
        const unsubscribingUser = await context.db.users.findOne({ key: 'id', equals: id });
        if (!unsubscribeFromUser) {
          throw new Error(`User for unsubscribe with id ${userId} does not exist`);
        } else if (!unsubscribingUser) {
          throw new Error(`Unsubcsribing user with id ${id} does not exist`);
        }
        const idx = unsubscribeFromUser?.subscribedToUserIds.indexOf(id);
        if (idx === -1) {
          throw new Error(`User with id ${id} not subscribed to user with id ${userId}`);
        }
        unsubscribeFromUser.subscribedToUserIds.splice(idx, 1);
        return { unsubscribeFrom: await context.db.users.change(userId, unsubscribeFromUser) };
      },
    },
  }),
});

// --- User ---
const UserPayloadType = new GraphQLObjectType({
  name: 'UserPayload',
  fields: () => ({
    user: { type: UserType },
  }),
});
const UserCreateInputType = new GraphQLInputObjectType({
  name: 'UserCreateInput',
  fields: () => ({
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
  }),
});
const UserUpdateInputType = new GraphQLInputObjectType({
  name: 'UserUpdateInput',
  fields: () => ({
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
  }),
});

// --- Post ---
const PostPayloadType = new GraphQLObjectType({
  name: 'PostPayload',
  fields: () => ({
    post: {type: PostType }
  }),
});
const PostCreateInputType = new GraphQLInputObjectType({
  name: 'PostCreateInput',
  fields: () => ({
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLID) },
  }),
});
const PostUpdateInputType = new GraphQLInputObjectType({
  name: 'PostUpdateInput',
  fields: () => ({
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }),
});

// --- Profile ---
const ProfilePayloadType = new GraphQLObjectType({
  name: 'ProfilePayload',
  fields: () => ({
    profile: { type: ProfileType },
  }),
});
const ProfileCreateInputType = new GraphQLInputObjectType({
  name: 'ProfileCreateInput',
  fields: () => ({
    avatar: { type: new GraphQLNonNull(GraphQLString) },
    sex: { type: new GraphQLNonNull(GraphQLString) },
    birthday: { type: new GraphQLNonNull(GraphQLFloat) },
    country: { type: new GraphQLNonNull(GraphQLString) },
    street: { type: new GraphQLNonNull(GraphQLString) },
    city: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLID) },
    memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
  }),
});
const ProfileUpdateInputType = new GraphQLInputObjectType({
  name: 'ProfileUpdateInput',
  fields: () => ({
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type:GraphQLFloat },
    country: { type:GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    memberTypeId: { type: GraphQLString },
  }),
});

// --- memberType ---
const MemberTypePayloadType = new GraphQLObjectType({
  name: 'MemberTypePayload',
  fields: () => ({
    memberType: { type: TypeOfMemberType },
  }),
});
const MemberTypeUpdateInputType = new GraphQLInputObjectType({
  name: 'MemberTypeUpdateInput',
  fields: () => ({
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt },
  }),
});

// --- Subscribes ---
const SubscribeToPayloadType = new GraphQLObjectType({
  name: 'SubscribeToPayload',
  fields: () => ({
    subscribeTo: { type: UserType },
  }),
});
const UnsubscribeFromPayloadType = new GraphQLObjectType({
  name: 'UnsubscribeFromPayload',
  fields: () => ({
    unsubscribeFrom: { type: UserType },
  }),
});
const SubscribeTo_UnsubscribeFromType = new GraphQLInputObjectType({
  name: 'SubscribeTo_UnsubscribeFrom',
  fields: () => ({
    userId: { type: new GraphQLNonNull(GraphQLID) },
  }),
});
