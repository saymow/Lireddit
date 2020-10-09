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
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPost> {
    const userId = req.session.userId;
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const parameters = [realLimitPlusOne] as any[];

    if (userId) parameters.push(userId);

    let cursorIdx = 3;

    if (cursor) {
      parameters.push(new Date(parseInt(cursor as string)));
      cursorIdx = parameters.length;
    }

    const posts = await getConnection().query(
      `
      SELECT p.*, 
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email
      ) creator,
      ${
        userId
          ? '(SELECT value FROM updoot WHERE "userId" = $2 AND "postId" = p.id) "voteStatus"'
          : 'null as "vouteStatus"'
      } 
      FROM post P 
      INNER JOIN public.user u ON u.id = p."creatorId"
      ${cursor ? `WHERE p."createdAt" < $${cursorIdx}` : ""}
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
    return Post.findOne(id, { relations: ["creator"] });
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
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }

    if (typeof title !== "undefined") {
      await Post.update({ id }, { title });
    }

    return post;
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
