import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from './user.model';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import {
  UpdateUserByAdminDto,
  UpdateUserProfileDto,
} from './dtos/update-user.dto';
import { UserListResponseDto, UserResponseDto } from './dtos/response-user.dto';
import type { SafeUser } from './user.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @Roles(UserRole.SUPERADMIN, UserRole.AGENT)
  async getProfile(@Req() req: AuthenticatedRequest): Promise<UserResponseDto> {
    const user = await this.userService.findOne(req.user.userId);
    return this.ensureAndMap(user);
  }

  @Put('me')
  @Roles(UserRole.SUPERADMIN, UserRole.AGENT)
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.userService.updateProfile(req.user.userId, dto);
    return this.ensureAndMap(user);
  }

  @Delete('me')
  @Roles(UserRole.SUPERADMIN, UserRole.AGENT)
  async removeProfile(@Req() req: AuthenticatedRequest) {
    await this.userService.remove(req.user.userId);
    return { message: 'Account deleted successfully.' };
  }

  @Post()
  @Roles(UserRole.SUPERADMIN)
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.create(dto);
    return this.userService.toResponseDto(user);
  }

  @Get()
  @Roles(UserRole.SUPERADMIN)
  async findAll(): Promise<UserListResponseDto> {
    const users = await this.userService.findAll();
    return this.userService.toListResponse(users);
  }

  @Get(':id')
  @Roles(UserRole.SUPERADMIN)
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.findOne(id);
    return this.ensureAndMap(user);
  }

  @Put(':id')
  @Roles(UserRole.SUPERADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserByAdminDto,
  ): Promise<UserResponseDto> {
    const user = await this.userService.update(id, dto);
    return this.ensureAndMap(user);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN)
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return { message: 'User deleted successfully.' };
  }
  private ensureAndMap(user: SafeUser | null): UserResponseDto {
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.userService.toResponseDto(user);
  }
}
