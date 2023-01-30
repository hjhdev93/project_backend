import { Body, Controller, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from 'src/auth/service/auth/auth.service';
import { LoginType } from '../../../user/entity/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //  네이버 로그인
  @Post('/naver/login/:code/:state')
  async naverLogin(
    @Param('code') code: string,
    @Param('state') state: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.naverLogin(code, state);
    response.cookie(user.refreshToken, { httpOnly: true });

    console.log('controller');

    return {
      id: user.id,
      username: user.username,
      loginType: user.loginType,
      accessToken: user.accessToken,
    };
  }

  //  카카오 로그인
  @Post('/kakao/login/:code')
  async kakaoLogin(
    @Param('code') code: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.kakaoLogin(code);
    response.cookie(user.refreshToken, { httpOnly: true });

    return {
      id: user.id,
      username: user.username,
      loginType: user.loginType,
      refreshToken: user.refreshToken,
    };
  }

  //  로그아웃
  @Post('/logout/:id/:logintype')
  logout(@Param('id') id: number, @Param('logintype') loginType: LoginType) {
    //  카카오 로그인 사용자인 경우
    if (loginType == 'kakao') {
      return this.authService.kakaoLogout(id);
    }

    //  네이버 로그인 사용자 경우
    if (loginType == 'naver') {
      return this.authService.naverLogout(id);
    }
  }

  //  회원탈퇴
  @Post('/deleteuser/:id/:logintype')
  deleteUser(
    @Param('id') id: number,
    @Param('logintype') loginType: LoginType,
  ) {
    //  카카오 로그인 사용자인 경우
    if (loginType == 'kakao') {
      return this.authService.kakaoDeleteUser(id);
    }

    //  네이버 로그인 사용자 경우
    if (loginType == 'naver') {
      return this.authService.naverDeleteUser(id);
    }
  }
}
