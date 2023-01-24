import { Body, Controller, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { LocalTokens } from 'src/auth/interfaces/localTokens.interface';
import { AuthService } from 'src/auth/service/auth/auth.service';
import { LoginType } from '../../../user/entity/user.entity';
import { Test } from '../../interfaces/test.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //  네이버 회원가입
  @Post('/naver/signup/:code/:state')
  naverSignup(@Param('code') code: string, @Param('state') state: string) {
    return this.authService.naverSignup(code, state);
  }

  //  네이버 로그인
  @Post('/naver/login/:code/:state')
  async naverLogin(
    @Param('code') code: string,
    @Param('state') state: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log(code, state);
    const token = await this.authService.naverLogin(code, state);
    response.cookie(token.refreshToken, { httpOnly: true });
    response.send(token.accessToken);

    return;
  }

  //  카카오 회원가입
  @Post('/kakao/signup/:code')
  kakaoSignup(@Param('code') code: string) {
    return this.authService.kakaoSignup(code);
  }

  //  카카오 로그인
  @Post('/kakao/login/:code')
  kakaoLogin(@Param('code') code: string) {
    return this.authService.kakaoLogin(code);
  }

  //  로그아웃
  @Post('/logout/:loginType')
  logout(@Param('loginType') loginType: LoginType, @Body() test: Test) {
    //  카카오 로그인 사용자인 경우
    if (loginType == 'kakao') {
      console.log('카카오');
      this.authService.kakaoLogout(test.id);
    }

    //  네이버 로그인 사용자 경우
    if (loginType == 'naver') {
      console.log(test.id);
      this.authService.naverLogout(test.id);
    }
  }

  //  회원탈퇴
  @Post('/deleteUser/:loginType')
  deleteUser(@Param('loginType') loginType: LoginType, @Body() body) {
    //  카카오 로그인 사용자인 경우
    if (loginType == 'kakao') {
      this.authService.kakaoDeleteUser(body.id);
    }

    //  네이버 로그인 사용자 경우
    if (loginType == 'naver') {
      this.authService.naverDeleteUser(body.id);
    }
  }
}
