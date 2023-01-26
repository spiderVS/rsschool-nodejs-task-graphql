import { GraphQLID, GraphQLList, /* GraphQLNonNull, */ GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    users: {
      type: new GraphQLList(UserType),
      resolve: async (_source, args, context) => {
        const { body: receivedUsers } = await context.inject({
          method: 'GET',
          url: `/users`,
        });
        console.log('🚀 receivedUsers:', receivedUsers);
        return JSON.parse(receivedUsers);
      },
    },
    user: {
      type: UserType,
      args: {
        id: {
          description: 'id of the user',
          type: GraphQLID,
        },
      },
      resolve: async (_source, { id }, context) => {
        console.log('🚀 id:', id);

        const { body: receivedUser } = await context.inject({
          method: 'GET',
          url: `/users/${id}`,
        });
        console.log('🚀 receivedUser:', receivedUser);
        console.log('🚀 typeof receivedUser:', typeof receivedUser);

        return JSON.parse(receivedUser);
      },
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID! },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
  }),
});

export const gqlSchema: GraphQLSchema = new GraphQLSchema({
  query: queryType,
  // types: [],
});
