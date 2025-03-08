import { restApi } from "./adapters/rest-adapter";
import { graphqlApi } from "./adapters/graphql/graphql-adapter";

export const apiClients = {
  graphql: graphqlApi,
  rest: restApi,
};
