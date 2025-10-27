import { UserResponseDto } from './response-user.dto';
import { PropertyResponseDto } from './response-property.dto';

export class TaskResponseDto {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  property: PropertyResponseDto;
  assignedTo: UserResponseDto;
  createdAt: Date;
  updatedAt: Date;
}

export class TaskListResponseDto {
  tasks: TaskResponseDto[];
  total: number;
}
