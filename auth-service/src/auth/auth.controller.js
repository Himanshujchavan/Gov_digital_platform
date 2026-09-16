const {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Dependencies,
} = require('@nestjs/common');
const { AuthService } = require('./auth.service');
const { UsersService } = require('../users/users.service');
const { JwtAuthGuard } = require('./guards/jwt-auth.guard');
const { RolesGuard } = require('./guards/roles.guard');
const { Roles } = require('./decorators/roles.decorator');
const { ApiResponse } = require('@maha-interop/shared');

@Controller('auth')
@Dependencies(AuthService, UsersService)
class AuthController {
  constructor(authService, usersService) {
    this.authService = authService;
    this.usersService = usersService;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body) {
    const result = await this.authService.login(body);
    return ApiResponse.success(result, 'Authentication successful');
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body) {
    const result = await this.authService.register(body);
    return ApiResponse.success(result, 'User registered successfully');
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body) {
    const result = await this.authService.refresh(body.refreshToken);
    return ApiResponse.success(result, 'Token refreshed successfully');
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return ApiResponse.success(req.user, 'Profile retrieved successfully');
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllUsers() {
    const users = await this.usersService.getAllUsers();
    return ApiResponse.success(users, 'User list retrieved successfully');
  }

  @Get('health')
  getHealth() {
    return ApiResponse.success(
      {
        service: 'auth-service',
        status: 'UP',
        timestamp: new Date().toISOString(),
      },
      'Auth service is healthy'
    );
  }
}

module.exports = { AuthController };
