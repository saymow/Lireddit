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
export class User extends BaseEntity {
  @Field() // GraphQL
  @PrimaryGeneratedColumn() // ORM
  id!: number;

  @Field(() => String) // GraphQL
  @CreateDateColumn() // ORM
  createdAt = Date;

  @Field(() => String) // GraphQL
  @UpdateDateColumn() // ORM
  updatedAt = Date;

  @Field() // GraphQL
  @Column({ unique: true }) // ORM
  username!: string;

  @Field() // GraphQL
  @Column({ unique: true }) // ORM
  email!: string;

  @Column() // ORM
  password!: string;
}
