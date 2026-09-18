import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user dengan username dan password' })
  @ApiResponse({ status: 200, description: 'Login berhasil, mengembalikan token JWT dan objek user beserta permissions' })
  @ApiResponse({ status: 401, description: 'Kredensial tidak valid' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
