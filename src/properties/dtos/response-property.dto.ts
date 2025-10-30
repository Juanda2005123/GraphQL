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
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class PropertyListResponseDto {
  properties: PropertyResponseDto[];
  total: number;
}
