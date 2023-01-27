import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { User } from './user/entity/user.entity';
import { UsersModule } from './user/user.module';
import { PostController } from './post/controller/post/post.controller';
import { PostModule } from './post/post.module';
import { Post } from './post/entity/Post';
import { Photo } from './post/entity/Photo';
import { Record } from './post/entity/Record';
import { CommentModule } from './comment/comment.module';
import { Comment } from './comment/entity/Comment';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      username: 'postgres',
      password: 'password',
      database: 'project',
      entities: [User, Post, Photo, Record, Comment],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    PostModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
