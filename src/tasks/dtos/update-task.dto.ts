import { IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';

export class UpdateTaskByAgentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

export class UpdateTaskByAdminDto extends UpdateTaskByAgentDto {
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}
