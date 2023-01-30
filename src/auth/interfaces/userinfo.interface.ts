export interface UserInfo {
  id: number;
  username: string;

  loginType: 'naver' | 'kakao';
  accessToken: string;
  refreshToken: string;
}
