import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { KakaoRenewTokenInfo } from '../interfaces/kakaoRenewTokenInfo.interface';
import { KakaoUserInfoByToken } from '../interfaces/kakaoUserInfoByToken.interface';
import { KakaoVerifyTokenInfo } from '../interfaces/kakaoVerifyTokenInfo.interface';

@Injectable()
export class KakaoAuth {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  //  토큰 요청
  async getToken(code: string): Promise<any> {
    const { data } = await firstValueFrom(
      this.httpService.get(
        `${this.configService.get<string>(
          'KAKAO_TOKEN_REQUEST_URL',
        )}&client_id=${this.configService.get<string>(
          'KAKAO_CLIENT_ID',
        )}&redirect_uri=${this.configService.get<string>(
          'KAKAO_REDIRECT_URI',
        )}&code=${code}&scope=${this.configService.get<string>(
          'KAKAO_INFO_SCOPE',
        )}`,
      ),
    );
    console.log(data);
    return data;
  }

  //  토큰으로 유저 정보 받아오기
  async getInfoByToken(access_token: string): Promise<KakaoUserInfoByToken> {
    const { data } = await firstValueFrom(
      this.httpService.get(
        `${this.configService.get<string>('KAKAO_INFO_REQUEST_URL')}`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      ),
    );

    console.log(data);

    const userInfo = {
      id: data.id,
      nickname: data.properties.nickname,
      email: data.kakao_account.email,
    };

    return userInfo;
  }

  //  access & refresh 토큰 재발급 (refresh토큰은 1달 미만의 기간이 남았을 경우만 재발급)
  async renewToken(refresh_token: string): Promise<KakaoRenewTokenInfo> {
    const { data } = await firstValueFrom(
      this.httpService.post(
        `${this.configService.get<string>(
          'KAKAO_TOKEN_REFRESH_URL',
        )}&client_id=${this.configService.get<string>(
          'KAKAO_CLIENT_ID',
        )}%refresh_token=${refresh_token}`,
      ),
    );

    return data;
  }

  //  access토큰 유효성 검사
  async verifyToken(access_token: string): Promise<KakaoVerifyTokenInfo> {
    const { data } = await firstValueFrom(
      this.httpService.get(
        `${this.configService.get<string>('KAKAO_TOKEN_VERIFY_URL')}`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      ),
    );

    return data;
  }

  //  로그아웃 -> 사용자 access & refresh 토큰 모두 만료
  async logout(access_token: string): Promise<number> {
    console.log('로그아웃');
    console.log(access_token);
    const { data } = await lastValueFrom(
      this.httpService.post(
        `${this.configService.get<string>('KAKAO_LOGOUT_URL')}`,
        {},
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      ),
    );

    console.log(data);
    return data;
  }

  //  회원탈퇴
  async deleteUser(access_token: string): Promise<string> {
    const { data } = await lastValueFrom(
      this.httpService.post(
        `${this.configService.get<string>('KAKAO_DELETE_ACCOUNT_URL')}`,
        {},
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      ),
    );

    //  회원 탈퇴 성공한 회원번호 반환
    return data.id;
  }
}
