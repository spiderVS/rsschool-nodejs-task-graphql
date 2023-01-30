import { GraphQLSchema } from "graphql";
import { mutationType } from "./types/mutation-types/mutation-types";
import { queryType } from "./types/query-types/query-types";


export const gqlSchema: GraphQLSchema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});
