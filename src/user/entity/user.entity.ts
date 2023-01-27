import {
  Column,
  CreateDateColumn,
  Entity, OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Post } from '../../post/entity/Post';


export type LoginType = 'naver' | 'kakao';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    default: '',
  })
  snsId: string;

  @Column({
    nullable: false,
    default: '',
  })
  loginType: LoginType;

  @Column({
    nullable: false,
    default: '',
  })
  useremail: string;

  @Column({
    nullable: false,
    default: '',
  })
  username: string;

  @Column({
    nullable: true,
  })
  accessToken: string;

  @Column({
    nullable: true,
  })
  refreshToken: string;

  @Column({
    nullable: true,
  })
  snsAccessToken: string;

  @Column({
    nullable: true,
  })
  snsRefreshToken: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @CreateDateColumn({ select: false })
  createdDate: Date;
}
