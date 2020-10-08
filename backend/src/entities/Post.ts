import { ObjectType, Field, Int } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Updoot } from "./Updoot";
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

  @Field(() => Int, { nullable: true })
  voteStatus: number;

  @Field()
  @Column()
  creatorId: number;

  @Field()
  @ManyToOne(() => User, (user) => user.posts)
  creator: User;

  @OneToMany(() => Updoot, (updoot) => updoot.post)
  updoots: Updoot[];

  @Field(() => String) // GraphQL
  @CreateDateColumn() // ORM
  createdAt: Date;

  @Field(() => String) // GraphQL
  @UpdateDateColumn() // ORM
  updatedAt: Date;
}
