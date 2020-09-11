import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field } from "type-graphql";

@ObjectType() // GraphQL
@Entity() // ORM
export class Post {
  @Field()  // GraphQL
  @PrimaryKey() // ORM
  id!: number;

  @Field(() => String) // GraphQL
  @Property({ type: "date" }) // ORM
  createdAt = new Date();

  @Field(() => String) // GraphQL
  @Property({ type: "date", onUpdate: () => new Date() }) // ORM
  updatedAt = new Date(); 

  @Field() // GraphQL
  @Property({ type: "text" }) // ORM
  title!: string;
}
