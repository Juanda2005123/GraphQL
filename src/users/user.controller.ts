import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
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

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @Roles(UserRole.SUPERADMIN, UserRole.AGENT)
  @ApiOperation({
    summary: 'Obtener perfil del usuario actual',
    description: 'Devuelve la información del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getProfile(@Req() req: AuthenticatedRequest): Promise<UserResponseDto> {
    const user = await this.userService.findOne(req.user.userId);
    return this.ensureAndMap(user);
  }

  @Put('me')
  @Roles(UserRole.SUPERADMIN, UserRole.AGENT)
  @ApiOperation({
    summary: 'Actualizar perfil del usuario actual',
    description: 'Permite al usuario actualizar su nombre, email o contraseña',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.userService.updateProfile(req.user.userId, dto);
    return this.ensureAndMap(user);
  }

  @Delete('me')
  @Roles(UserRole.SUPERADMIN, UserRole.AGENT)
  @HttpCode(204)
  @ApiOperation({
    summary: 'Eliminar cuenta del usuario actual',
    description:
      'Soft delete de la cuenta del usuario (solo si no tiene propiedades asignadas)',
  })
  @ApiResponse({ status: 204, description: 'Cuenta eliminada exitosamente' })
  @ApiResponse({ status: 400, description: 'Usuario tiene propiedades asignadas' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async removeProfile(@Req() req: AuthenticatedRequest): Promise<void> {
    await this.userService.remove(req.user.userId);
  }

  @Post()
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({
    summary: 'Crear nuevo usuario (Admin)',
    description: 'Solo superadmin puede crear usuarios con cualquier rol',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere rol superadmin)' })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.create(dto);
    return this.userService.toResponseDto(user);
  }

  @Get()
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({
    summary: 'Listar todos los usuarios (Admin)',
    description: 'Devuelve lista de todos los usuarios activos (no eliminados)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios',
    type: UserListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere rol superadmin)' })
  async findAll(): Promise<UserListResponseDto> {
    const users = await this.userService.findAll();
    return this.userService.toListResponse(users);
  }

  @Get(':id')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({
    summary: 'Obtener usuario por ID (Admin)',
    description: 'Devuelve información de un usuario específico',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere rol superadmin)' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.findOne(id);
    return this.ensureAndMap(user);
  }

  @Put(':id')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({
    summary: 'Actualizar usuario por ID (Admin)',
    description: 'Permite al superadmin actualizar cualquier campo del usuario',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere rol superadmin)' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserByAdminDto,
  ): Promise<UserResponseDto> {
    const user = await this.userService.update(id, dto);
    return this.ensureAndMap(user);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(204)
  @ApiOperation({
    summary: 'Eliminar usuario por ID (Admin)',
    description:
      'Soft delete de usuario (solo si no tiene propiedades asignadas)',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 204, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 400, description: 'Usuario tiene propiedades asignadas' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere rol superadmin)' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.userService.remove(id);
  }
  private ensureAndMap(user: SafeUser | null): UserResponseDto {
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.userService.toResponseDto(user);
  }
}
