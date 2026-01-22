import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PermissionsController } from './permissions/permissions.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { PermissionsService } from './permissions/permissions.service';
import { secrets } from '../config/secrets';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: secrets.JwtSecret,
      signOptions: { expiresIn: secrets.JwtExpiresIn },
    }),
  ],
  controllers: [AuthController, PermissionsController],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    LocalStrategy,
    RolesGuard,
    PermissionsGuard,
    PermissionsService,
  ],
  exports: [AuthService, JwtModule, RolesGuard, PermissionsGuard, PermissionsService],
})
export class AuthModule {}
