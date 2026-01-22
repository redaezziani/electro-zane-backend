import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    nullable: true
  })
  name: string | null;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.USER
  })
  role: UserRole;

  @ApiProperty({
    description: 'Whether user email has been verified',
    example: true
  })
  isEmailVerified: boolean;
}

export class AuthTokensDto {
  @ApiProperty({
    description: 'JWT access token (expires in 15 minutes)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ...'
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token (expires in 7 days)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ...'
  })
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'User information',
    type: UserResponseDto
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Authentication tokens',
    type: AuthTokensDto
  })
  tokens: AuthTokensDto;
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully'
  })
  message: string;
}

export class TokenValidationResponseDto {
  @ApiProperty({
    description: 'Whether the token is valid',
    example: true
  })
  valid: boolean;

  @ApiProperty({
    description: 'User information if token is valid',
    type: UserResponseDto
  })
  user: UserResponseDto;
}



export class UserDeviceDto {
  @ApiProperty({ description: 'Device ID' })
  id: string;

  @ApiProperty({ description: 'IP address of the device' })
  ip: string;

  @ApiProperty({ description: 'User agent string of the device' })
  userAgent: string;

  @ApiProperty({
    description: 'Device type',
    example: 'Desktop | Mobile | Tablet',
  })
  deviceType: string;

  @ApiProperty({
    description: 'Country of the device',
    nullable: true,
    required: false,
  })
  country: string | null;

  @ApiProperty({
    description: 'City of the device',
    nullable: true,
    required: false,
  })
  city: string | null;

  @ApiProperty({ description: 'Last time the device was used' })
  lastUsedAt: Date;
}
