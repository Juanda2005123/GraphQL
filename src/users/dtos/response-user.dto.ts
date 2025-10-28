import { UserRole } from 'src/users/user.model';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthResponseDto {
  token: string;
  user: UserResponseDto;
}

export class UserListResponseDto {
  users: UserResponseDto[];
  total: number;
}
