import express from "express";
import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import { __prod__ } from "./constants";
import { Post } from "./entities/Post";

import microConfig from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  const app = express();
  const PORT = process.env.PORT || "3333";

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver],
      validate: false,
    }),
  });

  apolloServer.applyMiddleware({ app });

  app.get("/", (_, res) => res.send("Cocô"));

  app.listen(PORT, () => {
    console.log("Server is up on:", PORT);
  });
};

main();
