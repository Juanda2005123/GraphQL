import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.model';
import { CreateUserDto } from './dtos/create-user.dto';
import {
  UpdateUserByAdminDto,
  UpdateUserProfileDto,
} from './dtos/update-user.dto';
import { UserListResponseDto, UserResponseDto } from './dtos/response-user.dto';
import * as bcrypt from 'bcryptjs';
import { Property } from 'src/properties/property.model';

export type SafeUser = Omit<User, 'password'>;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
  ) {}

  async create(dto: CreateUserDto): Promise<SafeUser> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({ ...dto, password: hashedPassword });
    const saved = await this.userRepo.save(user);
    return this.toSafeUser(saved);
  }

  async findAll(): Promise<SafeUser[]> {
    const users = await this.userRepo.find({ where: { isDeleted: false } });
    return users.map((user) => this.toSafeUser(user));
  }

  async findOne(id: string): Promise<SafeUser | null> {
    const user = await this.userRepo.findOne({
      where: { id, isDeleted: false },
    });
    return this.toSafeNullable(user);
  }

  async update(
    id: string,
    dto: Partial<UpdateUserByAdminDto>,
  ): Promise<SafeUser | null> {
    const updatePayload: Partial<User> = { ...dto };

    if (dto.password) {
      updatePayload.password = await bcrypt.hash(dto.password, 10);
    }

    await this.userRepo.update({ id, isDeleted: false }, updatePayload);
    return this.findOne(id);
  }

  async updateProfile(
    id: string,
    dto: UpdateUserProfileDto,
  ): Promise<SafeUser | null> {
    const updatePayload: Partial<User> = { ...dto };

    if (dto.password) {
      updatePayload.password = await bcrypt.hash(dto.password, 10);
    }

    await this.userRepo.update({ id, isDeleted: false }, updatePayload);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const propertiesCount = await this.propertyRepo.count({
      where: { isDeleted: false, owner: { id } },
    });

    if (propertiesCount > 0) {
      throw new BadRequestException(
        'Cannot delete user with active properties assigned.',
      );
    }

    await this.userRepo.update(
      { id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
    );
  }

  async findByEmail(
    email: string,
    options: { includeDeleted?: boolean } = {},
  ): Promise<User | null> {
    const where = options.includeDeleted
      ? { email }
      : { email, isDeleted: false };

    return this.userRepo.findOne({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isDeleted: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async restore(id: string): Promise<void> {
    await this.userRepo.update({ id }, { isDeleted: false, deletedAt: null });
  }

  private toSafeNullable(user: User | null): SafeUser | null {
    if (!user) {
      return null;
    }
    return this.toSafeUser(user);
  }

  toResponseDto(user: SafeUser): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  toListResponse(users: SafeUser[]): UserListResponseDto {
    return {
      users: users.map((user) => this.toResponseDto(user)),
      total: users.length,
    };
  }

  private toSafeUser(user: User): SafeUser {
    const { password: _password, ...safeUser } = user;
    void _password;
    return safeUser;
  }
}
