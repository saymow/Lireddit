import { ObjectType, Field } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@ObjectType() // GraphQL
@Entity() // ORM
export class Post extends BaseEntity {
  @Field() // GraphQL
  @PrimaryGeneratedColumn() // ORM
  id!: number;

  @Field() // GraphQL
  @Column() // ORM
  title!: string;

  @Field() // GraphQL
  @Column() // ORM
  text!: string;

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field()
  @Column()
  creatorId: number;

  @ManyToOne(() => User, (user) => user.posts)
  creator: User;

  @Field(() => String) // GraphQL
  @CreateDateColumn() // ORM
  createdAt: Date;

  @Field(() => String) // GraphQL
  @UpdateDateColumn() // ORM
  updatedAt: Date;
}
