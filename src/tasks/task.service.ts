import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.model';
import {
  CreateTaskByAdminDto,
  CreateTaskByAgentDto,
} from './dtos/create-task.dto';
import {
  UpdateTaskByAdminDto,
  UpdateTaskByAgentDto,
} from './dtos/update-task.dto';
import { Property } from 'src/properties/property.model';
import { User, UserRole } from 'src/users/user.model';
import { TaskListResponseDto, TaskResponseDto } from './dtos/response-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async listForAgent(agentId: string): Promise<TaskListResponseDto> {
    const tasks = await this.taskRepo.find({
      where: { isDeleted: false, assignedTo: { id: agentId } },
      relations: ['property', 'property.owner', 'assignedTo'],
    });
    const filtered = tasks.filter(
      (task) => task.property?.owner && task.property.owner.id === agentId,
    );
    return this.toListResponse(filtered);
  }

  async getForAgent(taskId: string, agentId: string): Promise<TaskResponseDto> {
    const task = await this.findTaskForAgentOrThrow(taskId, agentId);
    return this.toResponseDto(task);
  }

  async listByPropertyForAgent(
    propertyId: string,
    agentId: string,
  ): Promise<TaskListResponseDto> {
    await this.ensureAgentOwnsProperty(propertyId, agentId);
    const tasks = await this.taskRepo.find({
      where: {
        isDeleted: false,
        property: { id: propertyId },
      },
      relations: ['property', 'property.owner', 'assignedTo'],
    });
    return this.toListResponse(tasks);
  }

  async createForAgent(
    agentId: string,
    dto: CreateTaskByAgentDto,
  ): Promise<TaskResponseDto> {
    await this.ensureAgentOwnsProperty(dto.propertyId, agentId);
    const task = this.taskRepo.create({
      title: dto.title,
      description: dto.description,
      property: { id: dto.propertyId },
      assignedTo: { id: agentId },
    });
    const saved = await this.taskRepo.save(task);
    return this.getForAgent(saved.id, agentId);
  }

  async updateForAgent(
    taskId: string,
    agentId: string,
    dto: UpdateTaskByAgentDto,
  ): Promise<TaskResponseDto> {
    await this.findTaskForAgentOrThrow(taskId, agentId);
    await this.taskRepo.update({ id: taskId, isDeleted: false }, dto);
    return this.getForAgent(taskId, agentId);
  }

  async removeForAgent(taskId: string, agentId: string): Promise<void> {
    await this.findTaskForAgentOrThrow(taskId, agentId);
    await this.softDeleteTask(taskId);
  }

  async listForAdmin(): Promise<TaskListResponseDto> {
    const tasks = await this.taskRepo.find({
      where: { isDeleted: false },
      relations: ['property', 'property.owner', 'assignedTo'],
    });
    return this.toListResponse(tasks);
  }

  async getForAdmin(taskId: string): Promise<TaskResponseDto> {
    const task = await this.findTaskWithRelationsOrThrow(taskId);
    return this.toResponseDto(task);
  }

  async listByPropertyForAdmin(
    propertyId: string,
  ): Promise<TaskListResponseDto> {
    await this.findActivePropertyOrThrow(propertyId);
    const tasks = await this.taskRepo.find({
      where: {
        isDeleted: false,
        property: { id: propertyId },
      },
      relations: ['property', 'property.owner', 'assignedTo'],
    });
    return this.toListResponse(tasks);
  }

  async createForAdmin(dto: CreateTaskByAdminDto): Promise<TaskResponseDto> {
    const property = await this.findActivePropertyOrThrow(dto.propertyId);
    const assignee = await this.ensureAssignableUser(dto.assignedToId);

    const task = this.taskRepo.create({
      title: dto.title,
      description: dto.description,
      property: { id: property.id },
      assignedTo: { id: assignee.id },
    });
    const saved = await this.taskRepo.save(task);
    return this.getForAdmin(saved.id);
  }

  async updateForAdmin(
    taskId: string,
    dto: UpdateTaskByAdminDto,
  ): Promise<TaskResponseDto> {
    await this.findTaskWithRelationsOrThrow(taskId);

    const { propertyId, assignedToId, ...updatableFields } = dto;
    const updatePayload: Partial<Task> = { ...updatableFields };

    if (propertyId) {
      await this.findActivePropertyOrThrow(propertyId);
      updatePayload.property = { id: propertyId } as Property;
    }

    if (assignedToId) {
      const assignee = await this.ensureAssignableUser(assignedToId);
      updatePayload.assignedTo = assignee;
    }

    await this.taskRepo.update({ id: taskId, isDeleted: false }, updatePayload);
    return this.getForAdmin(taskId);
  }

  async removeForAdmin(taskId: string): Promise<void> {
    await this.findTaskWithRelationsOrThrow(taskId);
    await this.softDeleteTask(taskId);
  }

  async softDeleteByProperty(propertyId: string): Promise<void> {
    const now = new Date();
    await this.taskRepo.update(
      { property: { id: propertyId }, isDeleted: false },
      { isDeleted: true, deletedAt: now },
    );
  }

  toListResponse(tasks: Task[]): TaskListResponseDto {
    return {
      tasks: tasks.map((task) => this.toResponseDto(task)),
      total: tasks.length,
    };
  }

  toResponseDto(task: Task): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      isCompleted: task.isCompleted,
      propertyId: task.property ? task.property.id : undefined, // Changed from null to undefined
      assignedToId: task.assignedTo ? task.assignedTo.id : undefined, // Changed from null to undefined
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  private async findTaskForAgentOrThrow(
    taskId: string,
    agentId: string,
  ): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id: taskId, isDeleted: false },
      relations: ['property', 'property.owner', 'assignedTo'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (!task.assignedTo || task.assignedTo.id !== agentId) {
      throw new ForbiddenException('You do not have access to this task');
    }
    if (
      !task.property ||
      !task.property.owner ||
      task.property.owner.id !== agentId
    ) {
      throw new ForbiddenException('You do not own this property');
    }
    return task;
  }

  private async findTaskWithRelationsOrThrow(taskId: string): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id: taskId, isDeleted: false },
      relations: ['property', 'property.owner', 'assignedTo'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  private async ensureAgentOwnsProperty(
    propertyId: string,
    agentId: string,
  ): Promise<Property> {
    const property = await this.propertyRepo.findOne({
      where: { id: propertyId, isDeleted: false },
      relations: ['owner'],
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    if (!property.owner || property.owner.id !== agentId) {
      throw new ForbiddenException('You do not own this property');
    }
    return property;
  }

  private async findActivePropertyOrThrow(
    propertyId: string,
  ): Promise<Property> {
    const property = await this.propertyRepo.findOne({
      where: { id: propertyId, isDeleted: false },
      relations: ['owner'],
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    return property;
  }

  private async ensureAssignableUser(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id: userId, isDeleted: false },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== UserRole.AGENT) {
      throw new BadRequestException('Only agents can be assigned to tasks');
    }
    return user;
  }

  private async softDeleteTask(taskId: string): Promise<void> {
    await this.taskRepo.update(
      { id: taskId, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
    );
  }
}
