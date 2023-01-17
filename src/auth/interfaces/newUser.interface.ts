import { LoginType } from 'src/user/entity/user.entity';

export interface NewUser {
  snsId: string;
  loginType: LoginType;
  useremail: string;
  username: string;
}
