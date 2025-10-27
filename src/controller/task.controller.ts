import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { TaskService } from '../service/task.service';
import { CreateTaskDto } from '../dtos/create-task.dto';
import {
  UpdateTaskByAdminDto,
  UpdateTaskByAgentDto,
} from 'src/dtos/update-task.dto';

@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.taskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(id);
  }

  @Put('agent/:id')
  updateByAgent(@Param('id') id: string, @Body() dto: UpdateTaskByAgentDto) {
    return this.taskService.updateByAgent(id, dto);
  }

  @Put('admin/:id')
  updateByAdmin(@Param('id') id: string, @Body() dto: UpdateTaskByAdminDto) {
    return this.taskService.updateByAdmin(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskService.remove(id);
  }
}
