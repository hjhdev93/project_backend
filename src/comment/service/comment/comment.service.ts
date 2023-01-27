import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Comment } from '../../entity/Comment';
import { CreateCommentDto } from '../../dto/CreateCommentDto';
import { Post } from '../../../post/entity/Post';
import { UpdateCommentDto } from '../../dto/UpdateCommentDto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommentService {
  constructor(@InjectRepository(Comment) readonly commentRepository: Repository<Comment>, @InjectRepository(Post) readonly postRepository: Repository<Post>) {}

  //  댓글 10개씩 리턴
  async findCommentListByPage(id: number, page: number) {
    const commentList = await this.commentRepository.find({
      take: 10,
      skip: (page - 1) * 10,
    });

    return commentList;
  }

  //  댓글 작성
  async createComment(id: number, createCommentDto: CreateCommentDto) {
    const post = await this.postRepository.findOneBy({ id: id });
    const newComment = await this.commentRepository.create({ username: createCommentDto.username, content: createCommentDto.content, post });

    await this.commentRepository.save(newComment);

    return { id: newComment.id, username: newComment.username, content: newComment.content };
  }

  //  댓글 수정
  async updateComment(id: number, updateCommentDto: UpdateCommentDto) {
    return this.commentRepository.update(id, { content: updateCommentDto.content });
  }

  //  댓글 삭제
  async deleteComment(id: number) {
    return this.commentRepository.delete(id);
  }
}
