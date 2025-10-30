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

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('agent')
  @Roles(UserRole.AGENT)
  async listForAgent(
    @Req() req: AuthenticatedRequest,
  ): Promise<TaskListResponseDto> {
    return this.taskService.listForAgent(req.user.userId);
  }

  @Post('agent')
  @Roles(UserRole.AGENT)
  async createForAgent(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateTaskByAgentDto,
  ): Promise<TaskResponseDto> {
    return this.taskService.createForAgent(req.user.userId, dto);
  }

  @Get('agent/:id')
  @Roles(UserRole.AGENT)
  async getForAgent(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<TaskResponseDto> {
    return this.taskService.getForAgent(id, req.user.userId);
  }

  @Get('agent/property/:propertyId')
  @Roles(UserRole.AGENT)
  async listByPropertyForAgent(
    @Req() req: AuthenticatedRequest,
    @Param('propertyId') propertyId: string,
  ): Promise<TaskListResponseDto> {
    return this.taskService.listByPropertyForAgent(propertyId, req.user.userId);
  }

  @Put('agent/:id')
  @Roles(UserRole.AGENT)
  async updateForAgent(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateTaskByAgentDto,
  ): Promise<TaskResponseDto> {
    return this.taskService.updateForAgent(id, req.user.userId, dto);
  }

  @Delete('agent/:id')
  @Roles(UserRole.AGENT)
  @HttpCode(204)
  async removeForAgent(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<void> {
    await this.taskService.removeForAgent(id, req.user.userId);
  }

  @Get('admin')
  @Roles(UserRole.SUPERADMIN)
  async listForAdmin(): Promise<TaskListResponseDto> {
    return this.taskService.listForAdmin();
  }

  @Post('admin')
  @Roles(UserRole.SUPERADMIN)
  async createForAdmin(
    @Body() dto: CreateTaskByAdminDto,
  ): Promise<TaskResponseDto> {
    return this.taskService.createForAdmin(dto);
  }

  @Get('admin/:id')
  @Roles(UserRole.SUPERADMIN)
  async getForAdmin(@Param('id') id: string): Promise<TaskResponseDto> {
    return this.taskService.getForAdmin(id);
  }

  @Get('admin/property/:propertyId')
  @Roles(UserRole.SUPERADMIN)
  async listByPropertyForAdmin(
    @Param('propertyId') propertyId: string,
  ): Promise<TaskListResponseDto> {
    return this.taskService.listByPropertyForAdmin(propertyId);
  }

  @Put('admin/:id')
  @Roles(UserRole.SUPERADMIN)
  async updateForAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateTaskByAdminDto,
  ): Promise<TaskResponseDto> {
    return this.taskService.updateForAdmin(id, dto);
  }

  @Delete('admin/:id')
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(204)
  async removeForAdmin(@Param('id') id: string): Promise<void> {
    await this.taskService.removeForAdmin(id);
  }
}
