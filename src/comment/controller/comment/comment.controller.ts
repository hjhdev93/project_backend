import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CommentService } from '../../service/comment/comment.service';
import { CreateCommentDto } from '../../dto/CreateCommentDto';
import { UpdateCommentDto } from '../../dto/UpdateCommentDto';

@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  //  댓글 10개씩 가져오기
  @Get('/load/commentlist/:id/:page')
  async loadCommentListByPage(@Param('id', ParseIntPipe) id: number, @Param('page', ParseIntPipe) page: number) {
    return this.commentService.findCommentListByPage(id, page);
  }

  //  댓글 작성
  @Post('/create/comment/:id')
  async createComment(@Param('id', ParseIntPipe) id: number, @Body() createCommentDto: CreateCommentDto) {
    return this.commentService.createComment(id, createCommentDto);
  }

  //  댓글 수정
  @Put('/update/comment/:id')
  async updateComment(@Param('id', ParseIntPipe) id: number, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.updateComment(id, updateCommentDto);
  }

  //  댓글 삭제
  @Post('/delete/comment/:id')
  async deleteComment(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.deleteComment(id);
  }
}
