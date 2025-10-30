import { IsNotEmpty, IsString, MaxLength, IsUUID } from 'class-validator';

class BaseTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUUID()
  propertyId: string;
}

export class CreateTaskByAgentDto extends BaseTaskDto {}

export class CreateTaskByAdminDto extends BaseTaskDto {
  @IsUUID()
  assignedToId: string;
}
