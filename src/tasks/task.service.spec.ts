import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './task.model';
import { Property } from '../properties/property.model';
import { User, UserRole } from '../users/user.model';

describe('TaskService', () => {
  let service: TaskService;
  let taskRepository: Repository<Task>;
  let propertyRepository: Repository<Property>;
  let userRepository: Repository<User>;

  const mockTaskRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockPropertyRepository = {
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(Property),
          useValue: mockPropertyRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    propertyRepository = module.get<Repository<Property>>(getRepositoryToken(Property));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listForAgent', () => {
    it('should return only tasks for agent\'s properties', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Task 1',
          description: 'Description 1',
          isCompleted: false,
          isDeleted: false,
          property: {
            id: 'prop1',
            owner: { id: 'agent1' } as User,
          } as Property,
          assignedTo: { id: 'agent1' } as User,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockTaskRepository.find.mockResolvedValue(mockTasks);

      const result = await service.listForAgent('agent1');

      expect(result.tasks).toHaveLength(1);
    });

    it('should filter deleted tasks', async () => {
      mockTaskRepository.find.mockResolvedValue([]);

      await service.listForAgent('agent1');

      expect(mockTaskRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isDeleted: false }),
        }),
      );
    });
  });

  describe('getForAgent', () => {
    it('should return task if agent owns property', async () => {
      const mockTask = {
        id: '1',
        title: 'Task',
        description: 'Description',
        isCompleted: false,
        isDeleted: false,
        property: {
          id: 'prop1',
          owner: { id: 'agent1' } as User,
        } as Property,
        assignedTo: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.getForAgent('1', 'agent1');

      expect(result.id).toBe('1');
    });

    it('should throw ForbiddenException if not owner', async () => {
      const mockTask = {
        id: '1',
        title: 'Task',
        description: 'Description',
        isCompleted: false,
        isDeleted: false,
        property: {
          id: 'prop1',
          owner: { id: 'agent1' } as User,
        } as Property,
        assignedTo: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      await expect(service.getForAgent('1', 'agent2')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createForAgent', () => {
    it('should create task for agent\'s property', async () => {
      const createDto = {
        title: 'New Task',
        description: 'Description',
        propertyId: 'prop1',
      };

      const mockProperty = {
        id: 'prop1',
        owner: { id: 'agent1' } as User,
        isDeleted: false,
      } as Property;

      const mockTask = {
        id: '1',
        ...createDto,
        isCompleted: false,
        isDeleted: false,
        property: mockProperty,
        assignedTo: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);
      mockTaskRepository.create.mockReturnValue(mockTask);
      mockTaskRepository.save.mockResolvedValue(mockTask);
      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.createForAgent('agent1', createDto);

      expect(result).toBeDefined();
    });

    it('should auto-assign to agent', async () => {
      const createDto = {
        title: 'New Task',
        description: 'Description',
        propertyId: 'prop1',
      };

      const mockProperty = {
        id: 'prop1',
        owner: { id: 'agent1' } as User,
        isDeleted: false,
      } as Property;

      const mockTask = {
        id: '1',
        ...createDto,
        isCompleted: false,
        isDeleted: false,
        property: mockProperty,
        assignedTo: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);
      mockTaskRepository.create.mockReturnValue(mockTask);
      mockTaskRepository.save.mockResolvedValue(mockTask);
      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      await service.createForAgent('agent1', createDto);

      expect(mockTaskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          assignedTo: { id: 'agent1' },
        }),
      );
    });

    it('should throw error if agent doesn\'t own property', async () => {
      const createDto = {
        title: 'New Task',
        description: 'Description',
        propertyId: 'prop1',
      };

      const mockProperty = {
        id: 'prop1',
        owner: { id: 'agent2' } as User,
        isDeleted: false,
      } as Property;

      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);

      await expect(service.createForAgent('agent1', createDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateForAgent', () => {
    it('should update agent\'s task', async () => {
      const updateDto = {
        title: 'Updated Task',
        isCompleted: true,
      };

      const mockTask = {
        id: '1',
        title: 'Old Task',
        description: 'Description',
        isCompleted: false,
        isDeleted: false,
        property: {
          id: 'prop1',
          owner: { id: 'agent1' } as User,
        } as Property,
        assignedTo: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateForAgent('1', 'agent1', updateDto);

      expect(result).toBeDefined();
    });

    it('should throw error if not owner', async () => {
      const mockTask = {
        id: '1',
        title: 'Task',
        description: 'Description',
        isCompleted: false,
        isDeleted: false,
        property: {
          id: 'prop1',
          owner: { id: 'agent1' } as User,
        } as Property,
        assignedTo: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      await expect(
        service.updateForAgent('1', 'agent2', { title: 'Updated' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeForAgent', () => {
    it('should soft delete task', async () => {
      const mockTask = {
        id: '1',
        title: 'Task',
        description: 'Description',
        isCompleted: false,
        isDeleted: false,
        property: {
          id: 'prop1',
          owner: { id: 'agent1' } as User,
        } as Property,
        assignedTo: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.update.mockResolvedValue({ affected: 1 });

      await service.removeForAgent('1', 'agent1');

      expect(mockTaskRepository.update).toHaveBeenCalledWith(
        { id: '1', isDeleted: false },
        expect.objectContaining({
          isDeleted: true,
          deletedAt: expect.any(Date),
        }),
      );
    });

    it('should validate ownership', async () => {
      const mockTask = {
        id: '1',
        title: 'Task',
        description: 'Description',
        isCompleted: false,
        isDeleted: false,
        property: {
          id: 'prop1',
          owner: { id: 'agent1' } as User,
        } as Property,
        assignedTo: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      await expect(service.removeForAgent('1', 'agent2')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('listForAdmin', () => {
    it('should return all non-deleted tasks', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Task 1',
          description: 'Description',
          isCompleted: false,
          isDeleted: false,
          property: { id: 'prop1' } as Property,
          assignedTo: { id: 'agent1' } as User,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Task 2',
          description: 'Description',
          isCompleted: false,
          isDeleted: false,
          property: { id: 'prop2' } as Property,
          assignedTo: { id: 'agent2' } as User,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockTaskRepository.find.mockResolvedValue(mockTasks);

      const result = await service.listForAdmin();

      expect(result.tasks).toHaveLength(2);
    });
  });

  describe('createForAdmin', () => {
    it('should create task for any property', async () => {
      const createDto = {
        title: 'Admin Task',
        description: 'Description',
        propertyId: 'prop1',
        assignedToId: 'agent1',
      };

      const mockProperty = {
        id: 'prop1',
        owner: { id: 'agent2' } as User,
        isDeleted: false,
      } as Property;

      const mockAssignee = {
        id: 'agent1',
        role: UserRole.AGENT,
        isDeleted: false,
      } as User;

      const mockTask = {
        id: '1',
        ...createDto,
        isCompleted: false,
        isDeleted: false,
        property: mockProperty,
        assignedTo: mockAssignee,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);
      mockUserRepository.findOne.mockResolvedValue(mockAssignee);
      mockTaskRepository.create.mockReturnValue(mockTask);
      mockTaskRepository.save.mockResolvedValue(mockTask);
      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.createForAdmin(createDto);

      expect(result).toBeDefined();
    });

    it('should validate assignee is agent', async () => {
      const createDto = {
        title: 'Task',
        description: 'Description',
        propertyId: 'prop1',
        assignedToId: 'user1',
      };

      const mockProperty = {
        id: 'prop1',
        isDeleted: false,
      } as Property;

      const mockUser = {
        id: 'user1',
        role: UserRole.SUPERADMIN,
        isDeleted: false,
      } as User;

      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.createForAdmin(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw error if user not agent', async () => {
      const createDto = {
        title: 'Task',
        description: 'Description',
        propertyId: 'prop1',
        assignedToId: 'admin1',
      };

      const mockProperty = {
        id: 'prop1',
        isDeleted: false,
      } as Property;

      const mockAdmin = {
        id: 'admin1',
        role: UserRole.SUPERADMIN,
        isDeleted: false,
      } as User;

      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);
      mockUserRepository.findOne.mockResolvedValue(mockAdmin);

      await expect(service.createForAdmin(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.createForAdmin(createDto)).rejects.toThrow(
        'Only agents can be assigned to tasks',
      );
    });
  });

  describe('updateForAdmin', () => {
    it('should update any task', async () => {
      const updateDto = {
        title: 'Updated by Admin',
      };

      const mockTask = {
        id: '1',
        title: 'Old Task',
        description: 'Description',
        isCompleted: false,
        isDeleted: false,
        property: { id: 'prop1' } as Property,
        assignedTo: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateForAdmin('1', updateDto);

      expect(result).toBeDefined();
    });

    it('should allow changing property', async () => {
      const updateDto = {
        propertyId: 'prop2',
      };

      const mockTask = {
        id: '1',
        title: 'Task',
        description: 'Description',
        isCompleted: false,
        isDeleted: false,
        property: { id: 'prop1' } as Property,
        assignedTo: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockNewProperty = {
        id: 'prop2',
        isDeleted: false,
      } as Property;

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockPropertyRepository.findOne.mockResolvedValue(mockNewProperty);
      mockTaskRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateForAdmin('1', updateDto);

      expect(mockPropertyRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'prop2', isDeleted: false },
        relations: ['owner'],
      });
    });

    it('should allow changing assignee', async () => {
      const updateDto = {
        assignedToId: 'agent2',
      };

      const mockTask = {
        id: '1',
        title: 'Task',
        description: 'Description',
        isCompleted: false,
        isDeleted: false,
        property: { id: 'prop1' } as Property,
        assignedTo: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockNewAssignee = {
        id: 'agent2',
        role: UserRole.AGENT,
        isDeleted: false,
      } as User;

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockUserRepository.findOne.mockResolvedValue(mockNewAssignee);
      mockTaskRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateForAdmin('1', updateDto);

      expect(mockUserRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('removeForAdmin', () => {
    it('should soft delete any task', async () => {
      const mockTask = {
        id: '1',
        title: 'Task',
        description: 'Description',
        isCompleted: false,
        isDeleted: false,
        property: { id: 'prop1' } as Property,
        assignedTo: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.update.mockResolvedValue({ affected: 1 });

      await service.removeForAdmin('1');

      expect(mockTaskRepository.update).toHaveBeenCalledWith(
        { id: '1', isDeleted: false },
        expect.objectContaining({
          isDeleted: true,
          deletedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('listByPropertyForAgent', () => {
    it('should list tasks for agent\'s property', async () => {
      const mockProperty = {
        id: 'prop1',
        owner: { id: 'agent1' } as User,
        isDeleted: false,
      } as Property;

      const mockTasks = [
        {
          id: '1',
          title: 'Task 1',
          description: 'Description',
          isCompleted: false,
          isDeleted: false,
          property: mockProperty,
          assignedTo: { id: 'agent1' } as User,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);
      mockTaskRepository.find.mockResolvedValue(mockTasks);

      const result = await service.listByPropertyForAgent('prop1', 'agent1');

      expect(result.tasks).toHaveLength(1);
    });
  });

  describe('listByPropertyForAdmin', () => {
    it('should list tasks for any property', async () => {
      const mockProperty = {
        id: 'prop1',
        isDeleted: false,
      } as Property;

      const mockTasks = [
        {
          id: '1',
          title: 'Task 1',
          description: 'Description',
          isCompleted: false,
          isDeleted: false,
          property: mockProperty,
          assignedTo: { id: 'agent1' } as User,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);
      mockTaskRepository.find.mockResolvedValue(mockTasks);

      const result = await service.listByPropertyForAdmin('prop1');

      expect(result.tasks).toHaveLength(1);
    });
  });

  describe('toResponseDto', () => {
    it('should transform task to response DTO', () => {
      const task = {
        id: '1',
        title: 'Task',
        description: 'Description',
        isCompleted: false,
        property: { id: 'prop1' } as Property,
        assignedTo: { id: 'agent1' } as User,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.toResponseDto(task);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('propertyId');
      expect(result).toHaveProperty('assignedToId');
    });
  });
});

