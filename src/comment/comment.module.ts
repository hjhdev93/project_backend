import { Module } from '@nestjs/common';
import { CommentController } from './controller/comment/comment.controller';
import { CommentService } from './service/comment/comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entity/Comment';
import { PostModule } from '../post/post.module';
import { Post } from '../post/entity/Post';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post]), PostModule],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService, TypeOrmModule],
})
export class CommentModule {}
