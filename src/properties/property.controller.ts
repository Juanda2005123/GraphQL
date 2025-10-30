import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { UserRole } from '../users/user.model';
import { PropertyService } from './property.service';
import {
  CreatePropertyByAdminDto,
  CreatePropertyByAgentDto,
} from './dtos/create-property.dto';
import {
  UpdatePropertyByAdminDto,
  UpdatePropertyByAgentDto,
} from './dtos/update-property.dto';
import {
  PropertyListResponseDto,
  PropertyResponseDto,
} from './dtos/response-property.dto';
import { Public } from 'src/auth/public.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    role: UserRole;
  };
}

@ApiTags('properties')
@Controller('properties')
export class PropertyController {
  constructor(private propertyService: PropertyService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Listar todas las propiedades (Público)',
    description: 'Endpoint público que devuelve todas las propiedades activas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de propiedades',
    type: PropertyListResponseDto,
  })
  async getPublicList(): Promise<PropertyListResponseDto> {
    return this.propertyService.listPublic();
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Obtener propiedad por ID (Público)',
    description: 'Endpoint público que devuelve detalles de una propiedad',
  })
  @ApiParam({ name: 'id', description: 'ID de la propiedad' })
  @ApiResponse({
    status: 200,
    description: 'Propiedad encontrada',
    type: PropertyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  async getPublicOne(@Param('id') id: string): Promise<PropertyResponseDto> {
    return this.propertyService.getPublicById(id);
  }

  @Post('agent')
  @Roles(UserRole.AGENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear propiedad (Agente)',
    description: 'El agente crea una propiedad y se asigna como owner automáticamente',
  })
  @ApiResponse({
    status: 201,
    description: 'Propiedad creada exitosamente',
    type: PropertyResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere rol agente)' })
  async createForAgent(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreatePropertyByAgentDto,
  ): Promise<PropertyResponseDto> {
    return this.propertyService.createForAgent(req.user.userId, dto);
  }

  @Put('agent/:id')
  @Roles(UserRole.AGENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar propiedad (Agente)',
    description: 'El agente solo puede actualizar sus propias propiedades',
  })
  @ApiParam({ name: 'id', description: 'ID de la propiedad' })
  @ApiResponse({
    status: 200,
    description: 'Propiedad actualizada exitosamente',
    type: PropertyResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos o no es el owner' })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  async updateForAgent(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdatePropertyByAgentDto,
  ): Promise<PropertyResponseDto> {
    return this.propertyService.updateForAgent(id, dto, req.user.userId);
  }

  @Delete('agent/:id')
  @Roles(UserRole.AGENT)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Eliminar propiedad (Agente)',
    description:
      'Soft delete de la propiedad (también elimina tareas asociadas en cascada)',
  })
  @ApiParam({ name: 'id', description: 'ID de la propiedad' })
  @ApiResponse({ status: 204, description: 'Propiedad eliminada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos o no es el owner' })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  async removeForAgent(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.propertyService.removeForAgent(id, req.user.userId);
  }

  @Post('admin')
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear propiedad (Admin)',
    description: 'El superadmin puede crear una propiedad y asignar cualquier owner',
  })
  @ApiResponse({
    status: 201,
    description: 'Propiedad creada exitosamente',
    type: PropertyResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere rol superadmin)' })
  @ApiResponse({ status: 404, description: 'Owner no encontrado' })
  async createForAdmin(
    @Body() dto: CreatePropertyByAdminDto,
  ): Promise<PropertyResponseDto> {
    return this.propertyService.createForAdmin(dto);
  }

  @Put('admin/:id')
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar propiedad (Admin)',
    description: 'El superadmin puede actualizar cualquier propiedad',
  })
  @ApiParam({ name: 'id', description: 'ID de la propiedad' })
  @ApiResponse({
    status: 200,
    description: 'Propiedad actualizada exitosamente',
    type: PropertyResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere rol superadmin)' })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  async updateForAdmin(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyByAdminDto,
  ): Promise<PropertyResponseDto> {
    return this.propertyService.updateForAdmin(id, dto);
  }

  @Delete('admin/:id')
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Eliminar propiedad (Admin)',
    description:
      'El superadmin puede eliminar cualquier propiedad (soft delete con cascada a tareas)',
  })
  @ApiParam({ name: 'id', description: 'ID de la propiedad' })
  @ApiResponse({ status: 204, description: 'Propiedad eliminada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere rol superadmin)' })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  async removeForAdmin(@Param('id') id: string): Promise<void> {
    await this.propertyService.removeForAdmin(id);
  }
}
