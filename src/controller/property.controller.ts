import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { PropertyService } from '../service/property.service';
import { CreatePropertyDto } from '../dtos/create-property.dto';
import {
  UpdatePropertyByAdminDto,
  UpdatePropertyByAgentDto,
} from 'src/dtos/update-property.dto';

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
  updateByAgent(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyByAgentDto,
  ) {
    return this.propertyService.updateByAgent(id, dto);
  }

  @Put('admin/:id')
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
