import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field } from "type-graphql";

@ObjectType() // GraphQL
@Entity() // ORM
export class User {
  @Field() // GraphQL
  @PrimaryKey() // ORM
  id!: number;

  @Field(() => String) // GraphQL
  @Property({ type: "date" }) // ORM
  createdAt = new Date();

  @Field(() => String) // GraphQL
  @Property({ type: "date", onUpdate: () => new Date() }) // ORM
  updatedAt = new Date();

  @Field() // GraphQL
  @Property({ type: "text", unique: true }) // ORM
  username!: string;

  @Property({ type: "text" }) // ORM
  password!: string;
}
