import { Module } from '@nestjs/common';
import { PostService } from './service/post/post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entity/Post';
import { PostController } from './controller/post/post.controller';
import { Photo } from './entity/Photo';
import { UsersModule } from '../user/user.module';
import { Record } from './entity/Record';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Photo, Record]), UsersModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService, TypeOrmModule],
})
export class PostModule {}
