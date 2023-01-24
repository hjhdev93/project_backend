import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from 'src/user/dto/user.dto';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  //  유저 생성
  async createUser(user: UserDto) {
    const newUser = this.userRepository.create(user);

    return await this.userRepository.save(newUser);
  }

  async createUserToken(
    id: number,
    accessToken: string,
    refreshToken: string,
    snsAccessToken: string,
    snsRefreshToken: string,
  ) {
    return await this.userRepository.update(id, {
      accessToken: accessToken,
      refreshToken: refreshToken,
      snsAccessToken: snsAccessToken,
      snsRefreshToken: snsRefreshToken,
    });
  }

  //  snsId로 유저 조회
  async findUserBySnsId(snsId: string) {
    return await this.userRepository.findOneBy({ snsId: snsId });
  }

  //  id로 유저 조회
  async findUserById(id: number) {
    console.log(id);
    return await this.userRepository.findOneBy({ id: id });
  }

  //  access토큰 재발급
  async renewAccessTokenById(id: string, token: string) {
    return await this.userRepository.update(id, { accessToken: token });
  }

  //  refresh토큰 재발급
  async renewRefreshTokenById(id: string, token: string) {
    return await this.userRepository.update(id, { refreshToken: token });
  }

  //  snsAccess토큰 재발급
  async renewSnsAccessTokenById(id: number, token: string) {
    return await this.userRepository.update(id, { snsAccessToken: token });
  }

  //  snsRefreshToken 재발급
  async renewSnsRefreshTokenById(id: number, token: string) {
    return await this.userRepository.update(id, { snsRefreshToken: token });
  }

  //  토큰 삭제
  async deleteTokenById(id: number) {
    return await this.userRepository.update(id, {
      accessToken: null,
      refreshToken: null,
      snsAccessToken: null,
      snsRefreshToken: null,
    });
  }

  //  유저 삭제
  async deleteUserById(id: number) {
    return await this.userRepository.delete(id);
  }
}
