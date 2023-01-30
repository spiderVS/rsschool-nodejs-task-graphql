import { GraphQLError, GraphQLSchema, parse, validate } from "graphql";
import depthLimit = require('graphql-depth-limit');

export const depthLimiteValidate = (query: string, schema: GraphQLSchema, dLimit: number): GraphQLError | null => {
  const document = parse(query);
  const validationErrors = validate(schema, document, [depthLimit(dLimit)]);
  return (
    validationErrors.find(
      (error) => error.name === 'GraphQLError' && error.message.includes('exceeds maximum operation depth')
    ) ?? null
  );
};
