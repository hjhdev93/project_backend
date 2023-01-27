import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entity/Post';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { UsersService } from '../../../user/service/user/user.service';
import { User } from '../../../user/entity/user.entity';
import { CreateUserPostParams } from '../../interfaces/CreateUserPostParams';
import { Photo } from '../../entity/Photo';
import { PostList } from '../../interfaces/PostList';
import { PostDetail } from '../../interfaces/PostDetail';
import { UpdatePostDto } from '../../dto/UpdatePostDto';
import { NewPostDetail } from '../../interfaces/NewPostDetail';
import { UploadFileResult } from '../../interfaces/UploadFileResult';
import { Record } from '../../entity/Record';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(Photo) private readonly photoRepository: Repository<Photo>,
    @InjectRepository(Record) private readonly recordRepository: Repository<Record>,
    private configService: ConfigService,
    private userService: UsersService
  ) {}

  //  AWS S3 버킷에 파일 업로드
  async uploadFileS3(file): Promise<UploadFileResult> {
    const s3 = new S3();
    const uploadResult = await s3
      .upload(
        {
          Body: file.buffer,
          Bucket: this.configService.get('AWS_BUCKET_NAME'),
          Key: `${uuid()}-${file.originalname}`,
        },
        function (err, data) {
          if (err) console.log(err);
          else console.log(data);
        }
      )
      .promise();

    return { Location: uploadResult.Location, key: uploadResult.Key };
  }

  //  AWS S3 버킷에서 파일 삭제
  async deleteFileS3(key: string) {
    const s3 = new S3();

    //  S3에 있던 파일 삭제
    const deleteResult = await s3.deleteObject(
      {
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Key: key,
      },
      function (err, data) {
        if (err) {
          console.log('Error');
          return;
        }
        console.log('deleted');
      }
    );
    return deleteResult;
  }

  //  게시글 페이지네이션 10개씩
  async findPostListByPage(page: number): Promise<PostList[]> {
    const postList = await this.postRepository.find({
      take: 10,
      skip: (page - 1) * 10,
    });

    return postList;
  }

  //  게시글 가져오기
  async findPostById(id: number): Promise<PostDetail> {
    const [post] = await this.postRepository.find({
      where: { id },
      relations: { photos: true, record: true },
    });

    return post;
  }

  //  게시글 작성 (제목, 내용, 작성 유저네임)
  async createUserPost(id: number, createUserPostDetails: CreateUserPostParams): Promise<NewPostDetail> {
    const user = await this.userService.findUserById(id);
    if (!user) {
      throw new HttpException('User not found. Cannot create Post', HttpStatus.BAD_REQUEST);
    }

    //  새로운 게시글 내용
    const newPost = this.postRepository.create({
      ...createUserPostDetails,
      username: user.username,
      user,
    });

    //  새로운 게시글 DB에 저장
    await this.postRepository.save(newPost);

    const newPostInfo = { id: newPost.id, username: user.username, ...createUserPostDetails };

    return newPostInfo;
  }

  //  게시글 사진 업로드
  async uploadFile(id: number, files?: { photo?: Express.Multer.File[]; record?: Express.Multer.File }) {
    const post = await this.postRepository.findOneBy({ id: id });

    //  사진업로드
    if (files.photo) {
      for (let i = 0; i < files.photo.length; i++) {
        const photoUploadResult = await this.uploadFileS3(files.photo[i]);

        const newPhoto = this.photoRepository.create({
          fileName: files.photo[i].originalname,
          fileUrl: photoUploadResult.Location,
          key: photoUploadResult.key,
          post,
        });

        await this.photoRepository.save(newPhoto);
      }
    }

    if (files.record) {
      const recordUploadResult = await this.uploadFileS3(files.record[0]);
      const newRecord = this.recordRepository.create({
        fileName: files.record[0].originalname,
        fileUrl: recordUploadResult.Location,
        key: recordUploadResult.key,
        post,
      });
      await this.recordRepository.save(newRecord);
    }

    return;
  }

  //  게시글 수정
  async updatePost(id: number, updatePostDto?: UpdatePostDto, files?: { photo?: Express.Multer.File[]; record?: Express.Multer.File }) {
    //  수정할 제목, 내용이 있을시
    if (updatePostDto) {
      if (updatePostDto.title && updatePostDto.description) {
        await this.postRepository.update(id, { title: updatePostDto.title, description: updatePostDto.description });
      } else if (updatePostDto.title) {
        await this.postRepository.update(id, { title: updatePostDto.title });
      } else if (updatePostDto.description) {
        await this.postRepository.update(id, { description: updatePostDto.description });
      }
    }

    if (files.photo) {
      for (let i = 0; i < files.photo.length; i++) {
        console.log(updatePostDto.photoKey[i]);
        console.log(updatePostDto.photoId[i]);
        //  S3에 새로운 파일로 업로드
        const photoUpdateResult = await this.uploadFileS3(files.photo[i]);
        const photoDeleteResult = await this.deleteFileS3(updatePostDto.photoKey[i]);
        //  DB에 새로 업로드된 파일로 업데이트
        await this.photoRepository.update(updatePostDto.photoId[0], { fileName: files.photo[i].originalname, fileUrl: photoUpdateResult.Location, key: photoUpdateResult.key });
      }
    }

    if (files.record) {
      const recordUpdateResult = await this.uploadFileS3(files.record[0]);
      const recordDeleteResult = await this.deleteFileS3(updatePostDto.recordKey);
      //  DB에 새로 업로드된 파일로 업데이트
      await this.recordRepository.update(updatePostDto.recordId, { fileName: files.record[0].originalname, fileUrl: recordUpdateResult.Location, key: recordUpdateResult.key });
    }
  }

  //  게시글 삭제
  async deletePost(id: number) {
    const s3 = new S3();
    const [post] = await this.postRepository.find({
      where: { id },
      relations: { photos: true, record: true },
    });

    const photoList = post.photos;
    const record = post.record;

    //  게시글에 포함된 사진들 S3에서 삭제
    for (let i = 0; i < photoList.length; i++) {
      await this.deleteFileS3(photoList[i].key);
    }
    await this.deleteFileS3(record.key);

    //  DB에서 게시글 및 연관 내용 모두 삭제
    return this.postRepository.delete(id);
  }
}
