import "reflect-metadata";
import express from "express";
import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import { __prod__ } from "./constants";

import microConfig from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";
import { PostResoler } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import ConnectRedis from "connect-redis";
import { MyContext } from "./types";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  const app = express();
  const PORT = process.env.PORT || "3333";

  const RedisStore = ConnectRedis(session);
  const redisClient = redis.createClient({
    port: Number(process.env.REDIS_PORT),
  });

  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__, //Only works on https
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "default",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResoler, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res }),
  });

  apolloServer.applyMiddleware({ app });

  app.get("/", (_, res) => res.send("Cocô"));

  app.listen(PORT, () => {
    console.log("Server is up on:", PORT);
  });
};

main();
