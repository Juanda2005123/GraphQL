import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from 'src/properties/property.model';
import { Task } from 'src/tasks/task.model';
import { User } from 'src/users/user.model';
import {
  CreatePropertyByAdminDto,
  CreatePropertyByAgentDto,
} from 'src/properties/dtos/create-property.dto';
import {
  UpdatePropertyByAdminDto,
  UpdatePropertyByAgentDto,
} from './dtos/update-property.dto';
import {
  PropertyListResponseDto,
  PropertyResponseDto,
} from './dtos/response-property.dto';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async listPublic(): Promise<PropertyListResponseDto> {
    const properties = await this.propertyRepo.find({
      where: { isDeleted: false },
      relations: ['owner'],
    });
    return this.toListResponse(properties);
  }

  async getPublicById(id: string): Promise<PropertyResponseDto> {
    const property = await this.propertyRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['owner'],
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    return this.toResponseDto(property);
  }

  async createForAgent(
    agentId: string,
    dto: CreatePropertyByAgentDto,
  ): Promise<PropertyResponseDto> {
    const property = this.propertyRepo.create({
      ...dto,
      owner: { id: agentId },
    });
    const saved = await this.propertyRepo.save(property);
    return this.getPublicById(saved.id);
  }

  async updateForAgent(
    id: string,
    updatePropertyByAgentDto: UpdatePropertyByAgentDto,
    agentId: string,
  ): Promise<PropertyResponseDto> {
    const property = await this.findActivePropertyOrThrow(id);
    this.ensureAgentOwnsProperty(property, agentId);
    await this.propertyRepo.update(id, updatePropertyByAgentDto);
    return this.getPublicById(id);
  }

  async updateForAdmin(
    id: string,
    updatePropertyByAdminDto: UpdatePropertyByAdminDto,
  ): Promise<PropertyResponseDto> {
    await this.findActivePropertyOrThrow(id);

    const { ownerId, ...rest } = updatePropertyByAdminDto;
    const updateData: Partial<Property> = {
      ...rest,
    };

    if (ownerId) {
      const owner = await this.ensureOwnerExists(ownerId);
      updateData.owner = owner;
    }

    await this.propertyRepo.update({ id, isDeleted: false }, updateData);
    return this.getPublicById(id);
  }

  async removeForAgent(id: string, agentId: string): Promise<void> {
    const property = await this.findActivePropertyOrThrow(id);
    this.ensureAgentOwnsProperty(property, agentId);
    await this.softDeleteProperty(id);
  }

  async createForAdmin(
    dto: CreatePropertyByAdminDto,
  ): Promise<PropertyResponseDto> {
    const owner = await this.ensureOwnerExists(dto.ownerId);
    const property = this.propertyRepo.create({
      ...dto,
      owner,
    });
    const saved = await this.propertyRepo.save(property);
    return this.getPublicById(saved.id);
  }

  async removeForAdmin(id: string): Promise<void> {
    await this.findActivePropertyOrThrow(id);
    await this.softDeleteProperty(id);
  }

  toListResponse(properties: Property[]): PropertyListResponseDto {
    return {
      properties: properties.map((property) => this.toResponseDto(property)),
      total: properties.length,
    };
  }

  toResponseDto(property: Property): PropertyResponseDto {
    return {
      id: property.id,
      title: property.title,
      description: property.description,
      price: Number(property.price),
      location: property.location,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      imageUrls: property.imageUrls ?? [],
      ownerId: property.owner ? property.owner.id : null,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };
  }

  private async findActivePropertyOrThrow(id: string): Promise<Property> {
    const property = await this.propertyRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['owner'],
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    return property;
  }

  private ensureAgentOwnsProperty(property: Property, agentId: string): void {
    if (!property.owner || property.owner.id !== agentId) {
      throw new ForbiddenException('You do not own this property');
    }
  }

  private async ensureOwnerExists(ownerId: string): Promise<User> {
    const owner = await this.userRepo.findOne({
      where: { id: ownerId, isDeleted: false },
    });
    if (!owner) {
      throw new NotFoundException('Owner not found');
    }
    return owner;
  }

  private async softDeleteProperty(id: string): Promise<void> {
    const now = new Date();
    await this.propertyRepo.update(
      { id, isDeleted: false },
      { isDeleted: true, deletedAt: now },
    );
    await this.taskRepo.update(
      { property: { id }, isDeleted: false },
      { isDeleted: true, deletedAt: now },
    );
  }
}
