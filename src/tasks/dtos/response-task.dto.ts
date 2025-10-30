export class TaskResponseDto {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  propertyId: string | null;
  assignedToId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class TaskListResponseDto {
  tasks: TaskResponseDto[];
  total: number;
}
