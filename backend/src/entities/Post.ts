import { ObjectType, Field } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@ObjectType() // GraphQL
@Entity() // ORM
export class Post extends BaseEntity {
  @Field() // GraphQL
  @PrimaryGeneratedColumn() // ORM
  id!: number;

  @Field(() => String) // GraphQL
  @CreateDateColumn() // ORM
  createdAt: Date;

  @Field(() => String) // GraphQL
  @UpdateDateColumn() // ORM
  updatedAt: Date;

  @Field() // GraphQL
  @Column() // ORM
  title!: string;
}
