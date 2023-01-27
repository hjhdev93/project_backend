import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PostService } from '../../service/post/post.service';
import { CreateUserPostDto } from '../../dto/CreateUserPostDto';
import { UpdatePostDto } from '../../dto/UpdatePostDto';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  //  게시글 전체 리턴
  @Get('/load/postlist/:page')
  async loadPostListByPage(@Param('page', ParseIntPipe) page: number) {
    return this.postService.findPostListByPage(page);
  }

  //  게시글 하나 리턴
  @Get('/load/onepost/:id')
  async loadPostById(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findPostById(id);
  }

  //  게시글 작성
  @Post('/create/post/:id')
  async createPost(@Param('id', ParseIntPipe) id: number, @Body() createUserPostDto: CreateUserPostDto) {
    return this.postService.createUserPost(id, createUserPostDto);
  }

  //  게시글 작성
  @Post('/upload/postfile/:id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photo', maxCount: 3 },
      { name: 'record', maxCount: 1 },
    ])
  )
  async uploadPostFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles()
    files: {
      photo?: Express.Multer.File[];
      record?: Express.Multer.File;
    }
  ) {
    return this.postService.uploadFile(id, files);
  }

  //  게시글 수정
  @Put('/updatepost/:id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photo', maxCount: 3 },
      { name: 'record', maxCount: 1 },
    ])
  )
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles()
    files: {
      photo?: Express.Multer.File[];
      record?: Express.Multer.File;
    }
  ) {
    return this.postService.updatePost(id, updatePostDto, files);
  }

  //  게시글 삭제
  @Post('/delete/post/:id')
  async deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postService.deletePost(id);
  }
}
