import { UserResponseDto } from '../../users/dtos/response-user.dto';

export class PropertyResponseDto {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  imageUrls: string[];
  owner: string | UserResponseDto;
  createdAt: Date;
  updatedAt: Date;
}

export class PropertyListResponseDto {
  properties: PropertyResponseDto[];
  total: number;
}
