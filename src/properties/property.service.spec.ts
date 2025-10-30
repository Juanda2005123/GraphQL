import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PropertyService } from './property.service';
import { Property } from './property.model';
import { Task } from '../tasks/task.model';
import { User, UserRole } from '../users/user.model';

describe('PropertyService', () => {
  let service: PropertyService;
  let propertyRepository: Repository<Property>;
  let taskRepository: Repository<Task>;
  let userRepository: Repository<User>;

  const mockPropertyRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockTaskRepository = {
    update: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyService,
        {
          provide: getRepositoryToken(Property),
          useValue: mockPropertyRepository,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<PropertyService>(PropertyService);
    propertyRepository = module.get<Repository<Property>>(getRepositoryToken(Property));
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listPublic', () => {
    it('should return only non-deleted properties', async () => {
      const mockProperties = [
        {
          id: '1',
          title: 'Property 1',
          description: 'Description 1',
          price: 100000,
          location: 'Location 1',
          bedrooms: 3,
          bathrooms: 2,
          area: 150,
          imageUrls: [],
          isDeleted: false,
          owner: { id: 'user1', name: 'Owner 1' } as User,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPropertyRepository.find.mockResolvedValue(mockProperties);

      const result = await service.listPublic();

      expect(mockPropertyRepository.find).toHaveBeenCalledWith({
        where: { isDeleted: false },
        relations: ['owner'],
      });
      expect(result.properties).toHaveLength(1);
    });

    it('should include owner relations', async () => {
      mockPropertyRepository.find.mockResolvedValue([]);

      await service.listPublic();

      expect(mockPropertyRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: ['owner'],
        }),
      );
    });
  });

  describe('getPublicById', () => {
    it('should return property by id', async () => {
      const mockProperty = {
        id: '1',
        title: 'Property 1',
        description: 'Description',
        price: 100000,
        location: 'Location',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        imageUrls: [],
        isDeleted: false,
        owner: { id: 'user1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);

      const result = await service.getPublicById('1');

      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException for deleted properties', async () => {
      mockPropertyRepository.findOne.mockResolvedValue(null);

      await expect(service.getPublicById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createForAgent', () => {
    it('should create property with agent as owner', async () => {
      const createDto = {
        title: 'New Property',
        description: 'Description',
        price: 100000,
        location: 'Location',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        imageUrls: [],
      };

      const mockProperty = {
        id: '1',
        ...createDto,
        isDeleted: false,
        owner: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.create.mockReturnValue(mockProperty);
      mockPropertyRepository.save.mockResolvedValue(mockProperty);
      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);

      const result = await service.createForAgent('agent1', createDto);

      expect(mockPropertyRepository.create).toHaveBeenCalledWith({
        ...createDto,
        owner: { id: 'agent1' },
      });
      expect(result).toBeDefined();
    });

    it('should save and return property', async () => {
      const createDto = {
        title: 'New Property',
        description: 'Description',
        price: 100000,
        location: 'Location',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        imageUrls: [],
      };

      const mockProperty = {
        id: '1',
        ...createDto,
        isDeleted: false,
        owner: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.create.mockReturnValue(mockProperty);
      mockPropertyRepository.save.mockResolvedValue(mockProperty);
      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);

      await service.createForAgent('agent1', createDto);

      expect(mockPropertyRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateForAgent', () => {
    it('should update property owned by agent', async () => {
      const updateDto = {
        title: 'Updated Title',
        price: 120000,
      };

      const mockProperty = {
        id: '1',
        title: 'Old Title',
        description: 'Description',
        price: 100000,
        location: 'Location',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        imageUrls: [],
        isDeleted: false,
        owner: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findOne
        .mockResolvedValueOnce(mockProperty)
        .mockResolvedValueOnce({ ...mockProperty, ...updateDto });
      mockPropertyRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateForAgent('1', updateDto, 'agent1');

      expect(result.title).toBe(updateDto.title);
    });

    it('should throw ForbiddenException if not owner', async () => {
      const mockProperty = {
        id: '1',
        title: 'Property',
        description: 'Description',
        price: 100000,
        location: 'Location',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        imageUrls: [],
        isDeleted: false,
        owner: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);

      await expect(
        service.updateForAgent('1', { title: 'New Title' }, 'agent2'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if property deleted', async () => {
      mockPropertyRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateForAgent('1', { title: 'New Title' }, 'agent1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeForAgent', () => {
    it('should soft delete property', async () => {
      const mockProperty = {
        id: '1',
        title: 'Property',
        description: 'Description',
        price: 100000,
        location: 'Location',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        imageUrls: [],
        isDeleted: false,
        owner: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);
      mockPropertyRepository.update.mockResolvedValue({ affected: 1 });
      mockTaskRepository.update.mockResolvedValue({ affected: 0 });

      await service.removeForAgent('1', 'agent1');

      expect(mockPropertyRepository.update).toHaveBeenCalledWith(
        { id: '1', isDeleted: false },
        expect.objectContaining({
          isDeleted: true,
          deletedAt: expect.any(Date),
        }),
      );
    });

    it('should cascade soft delete to tasks', async () => {
      const mockProperty = {
        id: '1',
        title: 'Property',
        description: 'Description',
        price: 100000,
        location: 'Location',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        imageUrls: [],
        isDeleted: false,
        owner: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);
      mockPropertyRepository.update.mockResolvedValue({ affected: 1 });
      mockTaskRepository.update.mockResolvedValue({ affected: 2 });

      await service.removeForAgent('1', 'agent1');

      expect(mockTaskRepository.update).toHaveBeenCalledWith(
        { property: { id: '1' }, isDeleted: false },
        expect.objectContaining({
          isDeleted: true,
          deletedAt: expect.any(Date),
        }),
      );
    });

    it('should throw error if not owner', async () => {
      const mockProperty = {
        id: '1',
        title: 'Property',
        description: 'Description',
        price: 100000,
        location: 'Location',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        imageUrls: [],
        isDeleted: false,
        owner: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);

      await expect(service.removeForAgent('1', 'agent2')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createForAdmin', () => {
    it('should create property with specified owner', async () => {
      const createDto = {
        title: 'Admin Property',
        description: 'Description',
        price: 100000,
        location: 'Location',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        imageUrls: [],
        ownerId: 'agent1',
      };

      const mockOwner = {
        id: 'agent1',
        name: 'Agent',
        role: UserRole.AGENT,
      } as User;

      const mockProperty = {
        id: '1',
        ...createDto,
        isDeleted: false,
        owner: mockOwner,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockOwner);
      mockPropertyRepository.create.mockReturnValue(mockProperty);
      mockPropertyRepository.save.mockResolvedValue(mockProperty);
      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);

      const result = await service.createForAdmin(createDto);

      expect(result).toBeDefined();
    });

    it('should throw error if owner not found', async () => {
      const createDto = {
        title: 'Property',
        description: 'Description',
        price: 100000,
        location: 'Location',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        imageUrls: [],
        ownerId: 'invalid',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.createForAdmin(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateForAdmin', () => {
    it('should update any property', async () => {
      const updateDto = {
        title: 'Updated by Admin',
      };

      const mockProperty = {
        id: '1',
        title: 'Old Title',
        description: 'Description',
        price: 100000,
        location: 'Location',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        imageUrls: [],
        isDeleted: false,
        owner: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findOne
        .mockResolvedValueOnce(mockProperty)
        .mockResolvedValueOnce({ ...mockProperty, ...updateDto });
      mockPropertyRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateForAdmin('1', updateDto);

      expect(result.title).toBe(updateDto.title);
    });

    it('should allow changing owner', async () => {
      const updateDto = {
        ownerId: 'agent2',
      };

      const mockProperty = {
        id: '1',
        title: 'Property',
        description: 'Description',
        price: 100000,
        location: 'Location',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        imageUrls: [],
        isDeleted: false,
        owner: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newOwner = {
        id: 'agent2',
        name: 'New Owner',
        role: UserRole.AGENT,
      } as User;

      mockPropertyRepository.findOne
        .mockResolvedValueOnce(mockProperty)
        .mockResolvedValueOnce({ ...mockProperty, owner: newOwner });
      mockUserRepository.findOne.mockResolvedValue(newOwner);
      mockPropertyRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateForAdmin('1', updateDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'agent2', isDeleted: false },
      });
    });
  });

  describe('removeForAdmin', () => {
    it('should soft delete any property', async () => {
      const mockProperty = {
        id: '1',
        title: 'Property',
        description: 'Description',
        price: 100000,
        location: 'Location',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        imageUrls: [],
        isDeleted: false,
        owner: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);
      mockPropertyRepository.update.mockResolvedValue({ affected: 1 });
      mockTaskRepository.update.mockResolvedValue({ affected: 0 });

      await service.removeForAdmin('1');

      expect(mockPropertyRepository.update).toHaveBeenCalled();
    });

    it('should cascade soft delete to tasks', async () => {
      const mockProperty = {
        id: '1',
        title: 'Property',
        description: 'Description',
        price: 100000,
        location: 'Location',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        imageUrls: [],
        isDeleted: false,
        owner: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);
      mockPropertyRepository.update.mockResolvedValue({ affected: 1 });
      mockTaskRepository.update.mockResolvedValue({ affected: 3 });

      await service.removeForAdmin('1');

      expect(mockTaskRepository.update).toHaveBeenCalled();
    });
  });

  describe('toResponseDto', () => {
    it('should transform property to response DTO', () => {
      const property = {
        id: '1',
        title: 'Property',
        description: 'Description',
        price: 100000,
        location: 'Location',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        imageUrls: ['url1'],
        owner: { id: 'agent1' } as User,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.toResponseDto(property);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('ownerId');
      expect(result.ownerId).toBe('agent1');
    });
  });
});

