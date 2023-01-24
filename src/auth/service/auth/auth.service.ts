import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LocalTokens } from 'src/auth/interfaces/localTokens.interface';
import { NewUser } from 'src/auth/interfaces/newUser.interface';
import { KakaoAuth } from 'src/auth/utils/kakao.auth';
import { NaverAuth } from 'src/auth/utils/naver.auth';
import { UsersService } from 'src/user/service/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private kakaoAuth: KakaoAuth,
    private naverAuth: NaverAuth,
    private configService: ConfigService,
  ) {}

  //  access토큰 생성
  createAccessToken(nickname: string): Promise<string> {
    console.log(nickname);

    const token = this.jwtService.signAsync(
      { nickname: nickname },
      {
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_TOKEN_EXPIRATION_TIME'
        ),
        secret: this.configService.get<string>(
          'JWT_ACCESS_TOKEN_SECRET_KEY'
        ),
      },
    );

    return token;
  }

  //  refresh토큰 생성
  createRefreshToken(nickname: string): Promise<string> {
    const token = this.jwtService.signAsync(
      { nickname: nickname },
      {
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_TOKEN_EXPIRATION_TIME'
        ),
        secret: this.configService.get<string>(
          'JWT_REFRESH_TOKEN_SECRET_KEY'
        ),
      },
    );

    return token;
  }

  //  네이버 회원가입
  async naverSignup(code: string, state: string): Promise<NewUser> {
    const naverToken = await this.naverAuth.getToken(code, state);
    const naverUserInfo = await this.naverAuth.getInfoByToken(
      naverToken.access_token,
    );

    //  이미 회원가입된 회원이면 로그인 화면으로
    if (await this.userService.findUserBySnsId(naverUserInfo.id)) {
      console.log('이미 가입된 회원입니다');
      return;
    }
    const newUser: NewUser = {
      snsId: naverUserInfo.id,
      loginType: 'naver',
      useremail: naverUserInfo.email,
      username: naverUserInfo.nickname,
    };

    console.log('회원가입 성공');
    return await this.userService.createUser(newUser);
  }

  //  네이버 로그인
  async naverLogin(code: string, state: string): Promise<LocalTokens | null> {
    const naverToken = await this.naverAuth.getToken(code, state);
    const naverUserInfo = await this.naverAuth.getInfoByToken(
      naverToken.access_token,
    );

    const user = await this.userService.findUserBySnsId(naverUserInfo.id);
    console.log(user);

    if (user) {
      const internalAccessToken = await this.createAccessToken(
        naverUserInfo.nickname,
      );
      const internalRefreshToken = await this.createRefreshToken(
        naverUserInfo.nickname,
      );

      //  DB에 토큰 내용 저장
      await this.userService.createUserToken(
        user.id,
        internalAccessToken,
        internalRefreshToken,
        naverToken.access_token,
        naverToken.refresh_token,
      );

      console.log('로그인 성공');
      return {
        accessToken: internalAccessToken,
        refreshToken: internalRefreshToken,
      };
    }

    console.log('로그인 실패');
    return null;
  }

  //  네이버 로그아웃
  async naverLogout(id: number): Promise<void> {
    console.log('로그아웃');
    const user = await this.userService.findUserById(id);
    console.log(user.snsAccessToken);

    //  access토큰이 유효하지 않다면 재발급 요청
    if (!(await this.naverAuth.verifyToken(user.snsAccessToken))) {
      const token = await this.naverAuth.renewToken(user.snsRefreshToken);
      console.log('토큰');
      console.log(token);
      await this.userService.renewSnsAccessTokenById(id, token.access_token);
    }

    //  네이버 토큰 만료 요청
    await this.naverAuth.deleteToken(user.snsAccessToken);

    //  DB에 저장된 토큰값 만료
    await this.userService.deleteTokenById(id);
  }

  //  네이버 회원탈퇴
  async naverDeleteUser(id: number) {
    const user = await this.userService.findUserById(id);

    //  access토큰이 유효하지 않다면 재발급 요청
    if (!(await this.naverAuth.verifyToken(user.snsAccessToken))) {
      const token = await this.naverAuth.renewToken(user.snsRefreshToken);
      await this.userService.renewSnsAccessTokenById(id, token.access_token);
    }

    //  네이버 토큰 만료 요청
    await this.naverAuth.deleteToken(user.snsAccessToken);

    //  DB에서 유저 정보 삭제
    await this.userService.deleteUserById(id);

    console.log('회원탈퇴 성공');
  }

  //  카카오 회원가입
  async kakaoSignup(code: string): Promise<NewUser> {
    const kakaoToken = await this.kakaoAuth.getToken(code);
    const kakaoUserInfo = await this.kakaoAuth.getInfoByToken(
      kakaoToken.access_token,
    );

    if (await this.userService.findUserBySnsId(kakaoUserInfo.id)) {
      console.log('이미 회원가입된 계정입니다!');
      return;
    }

    const newUser: NewUser = {
      snsId: kakaoUserInfo.id,
      loginType: 'kakao',
      useremail: kakaoUserInfo.email,
      username: kakaoUserInfo.nickname,
    };

    console.log('회원가입 성공');
    return await this.userService.createUser(newUser);
  }

  //  카카오 로그인
  async kakaoLogin(code: string): Promise<LocalTokens | null> {
    const kakaoToken = await this.kakaoAuth.getToken(code);
    const kakaoUserInfo = await this.kakaoAuth.getInfoByToken(
      kakaoToken.access_token,
    );

    const user = await this.userService.findUserBySnsId(kakaoUserInfo.id);
    //  카카오에서 건내준 id값이 이미 DB에 있다면 토큰 발급하여 리턴
    if (user) {
      const internalAccessToken = await this.createAccessToken(
        kakaoUserInfo.nickname,
      );
      const internalRefreshToken = await this.createRefreshToken(
        kakaoUserInfo.nickname,
      );

      //  DB에 토큰 내용 저장
      await this.userService.createUserToken(
        user.id,
        internalAccessToken,
        internalRefreshToken,
        kakaoToken.access_token,
        kakaoToken.refresh_token,
      );

      console.log('로그인 성공');
      return {
        accessToken: internalAccessToken,
        refreshToken: internalRefreshToken,
      };
    }

    console.log('로그인 실패');
    return null;
  }

  //  카카오 로그아웃
  async kakaoLogout(id: number): Promise<void> {
    const user = await this.userService.findUserById(id);

    //  만약 access토큰이 유효하지 않다면
    if (!(await this.kakaoAuth.verifyToken(user.snsAccessToken))) {
      const token = await this.kakaoAuth.renewToken(user.snsRefreshToken);
      await this.userService.renewSnsAccessTokenById(id, token.access_token);

      //  카카오는 refresh토큰 잔여기간이 1달 미만인 경우에 다시 재발급 해주기 때문에, refresh토큰 재발급해준 경우에만 업데이트
      if (token.refresh_token) {
        await this.userService.renewSnsRefreshTokenById(
          id,
          token.refresh_token,
        );
      }
    }

    //  카카오 토큰 만료 요청
    await this.kakaoAuth.logout(user.snsAccessToken);

    //  DB에 저장된 토큰값 만료
    await this.userService.deleteTokenById(id);
    console.log('로그아웃 성공');
  }

  //  카카오 회원탈퇴
  async kakaoDeleteUser(id: number): Promise<void> {
    const user = await this.userService.findUserById(id);

    if (!user) {
      console.log('회원탈퇴 계정 찾을 수 없습니다');
      return;
    }

    //  만약 access토큰이 유효하지 않다면
    if (!(await this.kakaoAuth.verifyToken(user.snsAccessToken))) {
      const token = await this.kakaoAuth.renewToken(user.snsRefreshToken);
      await this.userService.renewSnsAccessTokenById(id, token.access_token);

      //  카카오는 refresh토큰 잔여기간이 1달 미만인 경우에 다시 재발급 해주기 때문에, refresh토큰 재발급해준 경우에만 업데이트
      if (token.refresh_token) {
        await this.userService.renewSnsRefreshTokenById(
          id,
          token.refresh_token,
        );
      }
    }

    //  카카오에 회원탈퇴 요청, 성공시 삭제한 유저의 id리턴
    const deletedUserId = await this.kakaoAuth.deleteUser(user.snsAccessToken);

    //  DB에서 유저 삭제
    await this.userService.deleteUserById(id);

    console.log('회원탈퇴 성공');
  }
}
