import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dtos/create-property.dto';
import {
  UpdatePropertyByAdminDto,
  UpdatePropertyByAgentDto,
} from 'src/properties/dtos/update-property.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('properties')
export class PropertyController {
  constructor(private propertyService: PropertyService) {}

  @Post()
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertyService.create(createPropertyDto);
  }

  @Get()
  findAll() {
    return this.propertyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Put('agent/:id')
  @Roles('agent')
  updateByAgent(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyByAgentDto,
  ) {
    return this.propertyService.updateByAgent(id, dto);
  }

  @Put('admin/:id')
  @Roles('superadmin')
  updateByAdmin(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyByAdminDto,
  ) {
    return this.propertyService.updateByAdmin(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertyService.remove(id);
  }
}
