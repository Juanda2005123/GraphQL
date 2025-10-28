import { IsOptional, IsString, IsBoolean } from 'class-validator';

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
  @IsString()
  property?: string;
}
