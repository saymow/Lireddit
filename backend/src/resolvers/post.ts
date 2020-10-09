import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import {
  Resolver,
  Query,
  Arg,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
  Int,
  FieldResolver,
  Root,
  ObjectType,
  Info,
} from "type-graphql";
import { Post } from "../entities/Post";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@ObjectType()
class PaginatedPost {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50).concat("...");
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { updootLoader, req }: MyContext
  ) {
    const userId = req.session.userId;

    if (!userId) return null;

    const updoot = await updootLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return updoot?.value;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const { userId } = req.session;
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;

    const updoot = await Updoot.findOne({
      where: {
        postId,
        userId,
      },
    });

    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async (em) => {
        await em.query(
          `
          UPDATE updoot SET value = $1 WHERE "postId" = $2 AND "userId" = $3; 
        `,
          [realValue, postId, userId]
        );

        await em.query(
          `
          UPDATE post 
          SET points = points + $1
          WHERE id = $2;
        `,
          [2 * realValue, postId]
        );
      });
    } else if (!updoot) {
      getConnection().transaction(async (em) => {
        await em.query(
          `
          INSERT INTO updoot ("userId", "postId", value)
          VALUES($1, $2, $3); 
        `,
          [userId, postId, realValue]
        );

        await em.query(
          `
          UPDATE post 
          SET points = points + $1
          WHERE id = $2;
        `,
          [realValue, postId]
        );
      });
    }

    return true;
  }

  @Query(() => PaginatedPost)
  async posts(
    @Arg("limit", () => Int!) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPost> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const parameters = [realLimitPlusOne] as any[];

    if (cursor) parameters.push(new Date(parseInt(cursor as string)));

    const posts = await getConnection().query(
      `
      SELECT p.* 
      FROM post P 
      ${cursor ? `WHERE p."createdAt" < $2` : ""}
      ORDER BY p."createdAt" DESC
      LIMIT $1
    `,
      parameters
    );

    // const qb = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder("post")
    //   .innerJoinAndSelect("post.creator", "user", 'user.id = post."creatorId"')
    //   .orderBy('post."createdAt"', "DESC")
    //   .take(realLimitPlusOne);

    // if (cursor) {
    //   qb.where('post."createdAt" < :cursor', {
    //     cursor: new Date(parseInt(cursor)),
    //   });
    // }

    // const posts = await qb.getMany();

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int!) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int!) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const { userId } = req.session;

    const response = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id AND "creatorId" = :userId', { userId, id })
      .returning("*")
      .execute();

    return response.raw[0];

    // return await Post.update({ id, creatorId: userId }, { title, text });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int!) id: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const { userId } = req.session;

    await Post.delete({ id, creatorId: userId });

    return true;
  }
}
