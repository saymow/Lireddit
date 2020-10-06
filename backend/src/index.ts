import "reflect-metadata";
import path from "path";
import { ApolloServer } from "apollo-server-express";
import ConnectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { Updoot } from "./entities/Updoot";

const main = async () => {
  const con = await createConnection({
    type: "postgres",
    database: process.env.PG_NAME,
    username: process.env.PG_NAME,
    password: process.env.PG_PASS,
    port: parseInt(process.env.PG_PORT as string),
    logging: true,
    synchronize: true,
    migrations: [path.resolve(__dirname, "migrations", "*")],
    entities: [Post, User, Updoot],
  });

  await con.runMigrations();

  const app = express();
  const PORT = process.env.PORT || "3333";

  const RedisStore = ConnectRedis(session);
  const redis = new Redis({
    port: Number(process.env.REDIS_PORT),
  });

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
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
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, redis }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.get("/", (_, res) => res.send("Cocô"));

  app.listen(PORT, () => {
    console.log("Server is up on:", PORT);
  });
};

main();
