import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from 'src/properties/property.model';
import { CreatePropertyDto } from 'src/properties/dtos/create-property.dto';
import {
  UpdatePropertyByAdminDto,
  UpdatePropertyByAgentDto,
} from './dtos/update-property.dto';

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
    return this.propertyRepo.find({
      where: { isDeleted: false },
      relations: ['owner'],
    });
  }

  async findOne(id: string): Promise<Property | null> {
    const property = await this.propertyRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['owner', 'tasks'],
    });
    if (!property) {
      return null;
    }
    property.tasks = property.tasks?.filter((task) => !task.isDeleted) ?? [];
    return property;
  }

  async updateByAgent(
    id: string,
    updatePropertyByAgentDto: UpdatePropertyByAgentDto,
  ): Promise<Property | null> {
    await this.propertyRepo.update(
      { id, isDeleted: false },
      updatePropertyByAgentDto,
    );
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

    await this.propertyRepo.update({ id, isDeleted: false }, updateData);
    return this.findOne(id);
  }
  async remove(id: string): Promise<void> {
    await this.propertyRepo.update(
      { id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
    );
  }
}
