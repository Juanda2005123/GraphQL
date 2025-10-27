import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../model/user.model';
import { Property } from 'src/model/property.model';
import { CreatePropertyDto } from 'src/dtos/create-property.dto';
import {
  UpdatePropertyByAdminDto,
  UpdatePropertyByAgentDto,
} from '../dtos/update-property.dto';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
  ) {}

  async create(createProperyDto: CreatePropertyDto): Promise<Property> {
    const propery = this.propertyRepo.create({
      ...createProperyDto,
      owner: createProperyDto.owner
        ? { id: createProperyDto.owner }
        : undefined,
    });
    return this.propertyRepo.save(propery);
  }

  async findAll(): Promise<Property[]> {
    return this.propertyRepo.find({ relations: ['owner'] });
  }

  async findOne(id: string): Promise<Property | null> {
    return this.propertyRepo.findOne({
      where: { id },
      relations: ['owner', 'tasks'],
    });
  }

  async updateByAgent(
    id: string,
    updatePropertyByAgentDto: UpdatePropertyByAgentDto,
  ): Promise<Property | null> {
    await this.propertyRepo.update(id, updatePropertyByAgentDto);
    return this.findOne(id);
  }

  async updateByAdmin(
    id: string,
    updatePropertyByAdminDto: UpdatePropertyByAdminDto,
  ): Promise<Property | null> {
    const updateData = {
      ...updatePropertyByAdminDto,
      owner: updatePropertyByAdminDto.owner
        ? { id: updatePropertyByAdminDto.owner }
        : undefined,
    };

    await this.propertyRepo.update(id, updateData);
    return this.findOne(id);
  }
  async remove(id: string): Promise<void> {
    await this.propertyRepo.delete(id);
  }
}
