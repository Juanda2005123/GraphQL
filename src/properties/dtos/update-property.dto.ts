import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePropertyByAgentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  area?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}

export class UpdatePropertyByAdminDto extends UpdatePropertyByAgentDto {
  @IsOptional()
  @IsString()
  ownerId?: string;
}
