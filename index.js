const { ApolloServer } = require("apollo-server");
const typeDefs = require("./types");
const resolvers = require("./resolver");
const { loader } = require("./loader");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    return { loader };
  },
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
