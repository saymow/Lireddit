import { ObjectType, Field } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";

@ObjectType() // GraphQL
@Entity() // ORM
export class User extends BaseEntity {
  @Field() // GraphQL
  @PrimaryGeneratedColumn() // ORM
  id!: number;

  @Field() // GraphQL
  @Column({ unique: true }) // ORM
  username!: string;

  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[];

  @Field() // GraphQL
  @Column({ unique: true }) // ORM
  email!: string;

  @Column() // ORM
  password!: string;

  @Field(() => String) // GraphQL
  @CreateDateColumn() // ORM
  createdAt = Date;

  @Field(() => String) // GraphQL
  @UpdateDateColumn() // ORM
  updatedAt = Date;
}
