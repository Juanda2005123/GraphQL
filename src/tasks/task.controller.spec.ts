import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { UserRole } from '../users/user.model';

describe('TaskController', () => {
  let controller: TaskController;
  let taskService: TaskService;

  const mockTaskService = {
    listForAgent: jest.fn(),
    createForAgent: jest.fn(),
    getForAgent: jest.fn(),
    listByPropertyForAgent: jest.fn(),
    updateForAgent: jest.fn(),
    removeForAgent: jest.fn(),
    listForAdmin: jest.fn(),
    createForAdmin: jest.fn(),
    getForAdmin: jest.fn(),
    listByPropertyForAdmin: jest.fn(),
    updateForAdmin: jest.fn(),
    removeForAdmin: jest.fn(),
  };

  const mockAgentRequest = {
    user: {
      userId: 'agent-123',
      email: 'agent@example.com',
      role: UserRole.AGENT,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    taskService = module.get<TaskService>(TaskService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listForAgent', () => {
    it('should return agent tasks', async () => {
      const mockResponse = {
        tasks: [
          {
            id: '1',
            title: 'Task 1',
            description: 'Description',
            isCompleted: false,
            propertyId: 'prop-1',
            assignedToId: 'agent-123',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
      };

      mockTaskService.listForAgent.mockResolvedValue(mockResponse);

      const result = await controller.listForAgent(mockAgentRequest as any);

      expect(mockTaskService.listForAgent).toHaveBeenCalledWith('agent-123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createForAgent', () => {
    it('should create task for agent', async () => {
      const createDto = {
        title: 'New Task',
        description: 'Task description',
        propertyId: 'prop-123',
      };

      const mockTask = {
        id: 'task-id',
        ...createDto,
        isCompleted: false,
        assignedToId: 'agent-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskService.createForAgent.mockResolvedValue(mockTask);

      const result = await controller.createForAgent(
        mockAgentRequest as any,
        createDto,
      );

      expect(mockTaskService.createForAgent).toHaveBeenCalledWith(
        'agent-123',
        createDto,
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('getForAgent', () => {
    it('should return task by id', async () => {
      const taskId = 'task-123';
      const mockTask = {
        id: taskId,
        title: 'Task',
        description: 'Description',
        isCompleted: false,
        propertyId: 'prop-123',
        assignedToId: 'agent-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskService.getForAgent.mockResolvedValue(mockTask);

      const result = await controller.getForAgent(
        mockAgentRequest as any,
        taskId,
      );

      expect(mockTaskService.getForAgent).toHaveBeenCalledWith(
        taskId,
        'agent-123',
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('listByPropertyForAgent', () => {
    it('should return tasks for property', async () => {
      const propertyId = 'prop-123';
      const mockResponse = {
        tasks: [],
        total: 0,
      };

      mockTaskService.listByPropertyForAgent.mockResolvedValue(mockResponse);

      const result = await controller.listByPropertyForAgent(
        mockAgentRequest as any,
        propertyId,
      );

      expect(mockTaskService.listByPropertyForAgent).toHaveBeenCalledWith(
        propertyId,
        'agent-123',
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateForAgent', () => {
    it('should update task', async () => {
      const taskId = 'task-123';
      const updateDto = {
        title: 'Updated Task',
        isCompleted: true,
      };

      const mockTask = {
        id: taskId,
        ...updateDto,
        description: 'Description',
        propertyId: 'prop-123',
        assignedToId: 'agent-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskService.updateForAgent.mockResolvedValue(mockTask);

      const result = await controller.updateForAgent(
        mockAgentRequest as any,
        taskId,
        updateDto,
      );

      expect(mockTaskService.updateForAgent).toHaveBeenCalledWith(
        taskId,
        'agent-123',
        updateDto,
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('removeForAgent', () => {
    it('should remove task', async () => {
      const taskId = 'task-123';

      mockTaskService.removeForAgent.mockResolvedValue(undefined);

      await controller.removeForAgent(mockAgentRequest as any, taskId);

      expect(mockTaskService.removeForAgent).toHaveBeenCalledWith(
        taskId,
        'agent-123',
      );
    });
  });

  describe('listForAdmin', () => {
    it('should return all tasks', async () => {
      const mockResponse = {
        tasks: [],
        total: 0,
      };

      mockTaskService.listForAdmin.mockResolvedValue(mockResponse);

      const result = await controller.listForAdmin();

      expect(mockTaskService.listForAdmin).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createForAdmin', () => {
    it('should create task as admin', async () => {
      const createDto = {
        title: 'Admin Task',
        description: 'Description',
        propertyId: 'prop-123',
        assignedToId: 'agent-456',
      };

      const mockTask = {
        id: 'task-id',
        ...createDto,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskService.createForAdmin.mockResolvedValue(mockTask);

      const result = await controller.createForAdmin(createDto);

      expect(mockTaskService.createForAdmin).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockTask);
    });
  });

  describe('getForAdmin', () => {
    it('should return any task by id', async () => {
      const taskId = 'task-123';
      const mockTask = {
        id: taskId,
        title: 'Task',
        description: 'Description',
        isCompleted: false,
        propertyId: 'prop-123',
        assignedToId: 'agent-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskService.getForAdmin.mockResolvedValue(mockTask);

      const result = await controller.getForAdmin(taskId);

      expect(mockTaskService.getForAdmin).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(mockTask);
    });
  });

  describe('listByPropertyForAdmin', () => {
    it('should return tasks for any property', async () => {
      const propertyId = 'prop-123';
      const mockResponse = {
        tasks: [],
        total: 0,
      };

      mockTaskService.listByPropertyForAdmin.mockResolvedValue(mockResponse);

      const result = await controller.listByPropertyForAdmin(propertyId);

      expect(mockTaskService.listByPropertyForAdmin).toHaveBeenCalledWith(
        propertyId,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateForAdmin', () => {
    it('should update any task', async () => {
      const taskId = 'task-123';
      const updateDto = {
        title: 'Admin Updated',
      };

      const mockTask = {
        id: taskId,
        title: updateDto.title,
        description: 'Description',
        isCompleted: false,
        propertyId: 'prop-123',
        assignedToId: 'agent-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskService.updateForAdmin.mockResolvedValue(mockTask);

      const result = await controller.updateForAdmin(taskId, updateDto);

      expect(mockTaskService.updateForAdmin).toHaveBeenCalledWith(
        taskId,
        updateDto,
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('removeForAdmin', () => {
    it('should remove any task', async () => {
      const taskId = 'task-123';

      mockTaskService.removeForAdmin.mockResolvedValue(undefined);

      await controller.removeForAdmin(taskId);

      expect(mockTaskService.removeForAdmin).toHaveBeenCalledWith(taskId);
    });
  });
});

