import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/user/user.module';
import { AuthController } from './controller/auth/auth.controller';
import { AuthService } from './service/auth/auth.service';
import { KakaoAuth } from './utils/kakao.auth';
import { NaverAuth } from './utils/naver.auth';

@Module({
  imports: [UsersModule, JwtModule, PassportModule, HttpModule],
  controllers: [AuthController],
  providers: [AuthService, KakaoAuth, NaverAuth],
})
export class AuthModule {}
