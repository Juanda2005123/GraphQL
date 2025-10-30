import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.model';
import { CreateTaskDto } from './dtos/create-task.dto';
import {
  UpdateTaskByAdminDto,
  UpdateTaskByAgentDto,
} from 'src/tasks/dtos/update-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepo.create({
      ...createTaskDto,
      property: createTaskDto.property
        ? { id: createTaskDto.property }
        : undefined,
    });
    return this.taskRepo.save(task);
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepo.find({
      where: { isDeleted: false },
      relations: ['property', 'assignedTo'],
    });
  }

  async findOne(id: string): Promise<Task | null> {
    return this.taskRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['property', 'assignedTo'],
    });
  }

  async updateByAgent(
    id: string,
    updateTaskDto: UpdateTaskByAgentDto,
  ): Promise<Task | null> {
    await this.taskRepo.update({ id, isDeleted: false }, updateTaskDto);
    return this.findOne(id);
  }

  async updateByAdmin(
    id: string,
    updateTaskDto: UpdateTaskByAdminDto,
  ): Promise<Task | null> {
    const updateData = {
      ...updateTaskDto,
      property: updateTaskDto.property
        ? { id: updateTaskDto.property }
        : undefined,
    };
    await this.taskRepo.update({ id, isDeleted: false }, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.taskRepo.update(
      { id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
    );
  }
}
