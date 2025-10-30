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

@Controller('properties')
export class PropertyController {
  constructor(private propertyService: PropertyService) {}

  @Get()
  @Public()
  async getPublicList(): Promise<PropertyListResponseDto> {
    return this.propertyService.listPublic();
  }

  @Get(':id')
  @Public()
  async getPublicOne(@Param('id') id: string): Promise<PropertyResponseDto> {
    return this.propertyService.getPublicById(id);
  }

  @Post('agent')
  @Roles(UserRole.AGENT)
  async createForAgent(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreatePropertyByAgentDto,
  ): Promise<PropertyResponseDto> {
    return this.propertyService.createForAgent(req.user.userId, dto);
  }

  @Put('agent/:id')
  @Roles(UserRole.AGENT)
  async updateForAgent(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdatePropertyByAgentDto,
  ): Promise<PropertyResponseDto> {
    return this.propertyService.updateForAgent(id, dto, req.user.userId);
  }

  @Delete('agent/:id')
  @Roles(UserRole.AGENT)
  @HttpCode(204)
  async removeForAgent(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.propertyService.removeForAgent(id, req.user.userId);
  }

  @Post('admin')
  @Roles(UserRole.SUPERADMIN)
  async createForAdmin(
    @Body() dto: CreatePropertyByAdminDto,
  ): Promise<PropertyResponseDto> {
    return this.propertyService.createForAdmin(dto);
  }

  @Put('admin/:id')
  @Roles(UserRole.SUPERADMIN)
  async updateForAdmin(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyByAdminDto,
  ): Promise<PropertyResponseDto> {
    return this.propertyService.updateForAdmin(id, dto);
  }

  @Delete('admin/:id')
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(204)
  async removeForAdmin(@Param('id') id: string): Promise<void> {
    await this.propertyService.removeForAdmin(id);
  }
}
