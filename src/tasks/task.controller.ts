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
import { UserRole } from 'src/users/user.model';
import {
  CreateTaskByAgentDto,
  CreateTaskByAdminDto,
} from './dtos/create-task.dto';
import {
  UpdateTaskByAdminDto,
  UpdateTaskByAgentDto,
} from './dtos/update-task.dto';
import { TaskListResponseDto, TaskResponseDto } from './dtos/response-task.dto';
import { TaskService } from './task.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('agent')
  @Roles(UserRole.AGENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar tareas del agente',
    description:
      'El agente lista todas sus tareas (de propiedades que le pertenecen)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tareas del agente',
    type: TaskListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos (requiere rol agente)',
  })
  async listForAgent(
    @Req() req: AuthenticatedRequest,
  ): Promise<TaskListResponseDto> {
    return this.taskService.listForAgent(req.user.userId);
  }

  @Post('agent')
  @Roles(UserRole.AGENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear tarea (Agente)',
    description: 'El agente crea una tarea en una de sus propiedades',
  })
  @ApiResponse({
    status: 201,
    description: 'Tarea creada exitosamente',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos o propiedad no pertenece al agente',
  })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  async createForAgent(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateTaskByAgentDto,
  ): Promise<TaskResponseDto> {
    return this.taskService.createForAgent(req.user.userId, dto);
  }

  @Get('agent/:id')
  @Roles(UserRole.AGENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener tarea por ID (Agente)',
    description: 'El agente obtiene una de sus tareas',
  })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({
    status: 200,
    description: 'Tarea encontrada',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos o tarea no pertenece al agente',
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async getForAgent(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<TaskResponseDto> {
    return this.taskService.getForAgent(id, req.user.userId);
  }

  @Get('agent/property/:propertyId')
  @Roles(UserRole.AGENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar tareas por propiedad (Agente)',
    description:
      'El agente lista tareas de una propiedad específica que le pertenece',
  })
  @ApiParam({ name: 'propertyId', description: 'ID de la propiedad' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tareas de la propiedad',
    type: TaskListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos o propiedad no pertenece al agente',
  })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  async listByPropertyForAgent(
    @Req() req: AuthenticatedRequest,
    @Param('propertyId') propertyId: string,
  ): Promise<TaskListResponseDto> {
    return this.taskService.listByPropertyForAgent(propertyId, req.user.userId);
  }

  @Put('agent/:id')
  @Roles(UserRole.AGENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar tarea (Agente)',
    description: 'El agente actualiza una de sus tareas',
  })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({
    status: 200,
    description: 'Tarea actualizada exitosamente',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos o tarea no pertenece al agente',
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async updateForAgent(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateTaskByAgentDto,
  ): Promise<TaskResponseDto> {
    return this.taskService.updateForAgent(id, req.user.userId, dto);
  }

  @Delete('agent/:id')
  @Roles(UserRole.AGENT)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Eliminar tarea (Agente)',
    description: 'El agente elimina (soft delete) una de sus tareas',
  })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({ status: 204, description: 'Tarea eliminada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos o tarea no pertenece al agente',
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async removeForAgent(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<void> {
    await this.taskService.removeForAgent(id, req.user.userId);
  }

  @Get('admin')
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar todas las tareas (Admin)',
    description: 'El superadmin lista todas las tareas del sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las tareas',
    type: TaskListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos (requiere rol superadmin)',
  })
  async listForAdmin(): Promise<TaskListResponseDto> {
    return this.taskService.listForAdmin();
  }

  @Post('admin')
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear tarea (Admin)',
    description: 'El superadmin crea una tarea en cualquier propiedad',
  })
  @ApiResponse({
    status: 201,
    description: 'Tarea creada exitosamente',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos (requiere rol superadmin)',
  })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  async createForAdmin(
    @Body() dto: CreateTaskByAdminDto,
  ): Promise<TaskResponseDto> {
    return this.taskService.createForAdmin(dto);
  }

  @Get('admin/:id')
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener tarea por ID (Admin)',
    description: 'El superadmin obtiene cualquier tarea',
  })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({
    status: 200,
    description: 'Tarea encontrada',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos (requiere rol superadmin)',
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async getForAdmin(@Param('id') id: string): Promise<TaskResponseDto> {
    return this.taskService.getForAdmin(id);
  }

  @Get('admin/property/:propertyId')
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar tareas por propiedad (Admin)',
    description: 'El superadmin lista tareas de cualquier propiedad',
  })
  @ApiParam({ name: 'propertyId', description: 'ID de la propiedad' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tareas de la propiedad',
    type: TaskListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos (requiere rol superadmin)',
  })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  async listByPropertyForAdmin(
    @Param('propertyId') propertyId: string,
  ): Promise<TaskListResponseDto> {
    return this.taskService.listByPropertyForAdmin(propertyId);
  }

  @Put('admin/:id')
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar tarea (Admin)',
    description: 'El superadmin actualiza cualquier tarea',
  })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({
    status: 200,
    description: 'Tarea actualizada exitosamente',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos (requiere rol superadmin)',
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async updateForAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateTaskByAdminDto,
  ): Promise<TaskResponseDto> {
    return this.taskService.updateForAdmin(id, dto);
  }

  @Delete('admin/:id')
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Eliminar tarea (Admin)',
    description: 'El superadmin elimina (soft delete) cualquier tarea',
  })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({ status: 204, description: 'Tarea eliminada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos (requiere rol superadmin)',
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async removeForAdmin(@Param('id') id: string): Promise<void> {
    await this.taskService.removeForAdmin(id);
  }
}
