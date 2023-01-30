import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { NaverRenewTokenInfo } from '../interfaces/naverRenewTokenInfo.interface';
import { NaverTokenInfo } from '../interfaces/naverTokenInfo.interface';
import { NaverUserInfoByToken } from '../interfaces/naverUserInfoByToken.interface';
import { NaverVerifyTokenInfo } from '../interfaces/naverVerifyTokenInfo.interface';

@Injectable()
export class NaverAuth {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  //  토큰 요청
  async getToken(code: string, state: string): Promise<NaverTokenInfo> {
    const { data } = await firstValueFrom(
      this.httpService.get(
        `${this.configService.get<string>(
          'NAVER_TOKEN_REQUEST_URL',
        )}&client_id=${this.configService.get<string>(
          'NAVER_CLIENT_ID',
        )}&client_secret=${this.configService.get<string>(
          'NAVER_CLIENT_SECRET',
        )}=${code}&state=${state}`,
      ),
    );

    console.log(data);

    return data;
  }

  //  토큰으로 유저 정보 받아오기
  async getInfoByToken(access_token: string): Promise<NaverUserInfoByToken> {
    const { data } = await firstValueFrom(
      this.httpService.get(
        `${this.configService.get<string>('NAVER_INFO_REQUEST_URL')}`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      ),
    );

    console.log(data);

    return data.response;
  }

  //  access토큰 재발급
  async renewToken(refresh_token: string): Promise<NaverRenewTokenInfo> {
    const { data } = await firstValueFrom(
      this.httpService.get(
        `${this.configService.get<string>(
          'NAVER_TOKEN_REFRESH_URL',
        )}&client_id=${this.configService.get<string>(
          'NAVER_CLIENT_ID',
        )}&client_secret=${this.configService.get<string>(
          'NAVER_CLIENT_SECRET',
        )}&refresh_token=${refresh_token}`,
      ),
    );

    return data;
  }

  //  access토큰 유효성 검사
  async verifyToken(access_token: string): Promise<NaverVerifyTokenInfo> {
    console.log('유효성 검사');
    console.log(access_token);
    const { data } = await firstValueFrom(
      this.httpService.get(
        `${this.configService.get<string>('NAVER_TOKEN_VERIFY_URL')}`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      ),
    );

    console.log(data);
    return data;
  }

  // //  로그아웃 -> 사용자 access & refresh 토큰 모두 만료
  // async logout(refresh_token: string) {
  //   const { data } = await lastValueFrom(
  //     this.httpService.get(
  //       `${this.configService.get<string>(
  //         'NAVER_LOGOUT_URL',
  //       )}&client_id=${this.configService.get<string>(
  //         'NAVER_CLIENT_ID',
  //       )}&client_secret=${this.configService.get<string>(
  //         'NAVER_CLIENT_SECRET',
  //       )}&access_token=${refresh_token}`,
  //     ),
  //   );
  //   console.log(data);
  //   return data;
  // }

  //  회원탈퇴
  async deleteUser(access_token: string) {
    console.log(access_token);
    console.log(
      `${this.configService.get<string>(
        'NAVER_DELETE_ACCOUNT_URL',
      )}&client_id=${this.configService.get<string>(
        'NAVER_CLIENT_ID',
      )}&client_secret=${this.configService.get<string>(
        'NAVER_CLIENT_SECRET',
      )}&access_token=${access_token}`,
    );
    const { data } = await lastValueFrom(
      this.httpService.get(
        `${this.configService.get<string>(
          'NAVER_DELETE_ACCOUNT_URL',
        )}&client_id=${this.configService.get<string>(
          'NAVER_CLIENT_ID',
        )}&client_secret=${this.configService.get<string>(
          'NAVER_CLIENT_SECRET',
        )}&access_token=${access_token}&service_provider=NAVER`,
      ),
    );
    console.log('naverAuth');
    console.log(data);
    return data;
  }
}
