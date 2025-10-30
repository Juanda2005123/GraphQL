import { Test, TestingModule } from '@nestjs/testing';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { UserRole } from '../users/user.model';

describe('PropertyController', () => {
  let controller: PropertyController;
  let propertyService: PropertyService;

  const mockPropertyService = {
    listPublic: jest.fn(),
    getPublicById: jest.fn(),
    createForAgent: jest.fn(),
    updateForAgent: jest.fn(),
    removeForAgent: jest.fn(),
    createForAdmin: jest.fn(),
    updateForAdmin: jest.fn(),
    removeForAdmin: jest.fn(),
  };

  const mockAgentRequest = {
    user: {
      userId: 'agent-123',
      role: UserRole.AGENT,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyController],
      providers: [
        {
          provide: PropertyService,
          useValue: mockPropertyService,
        },
      ],
    }).compile();

    controller = module.get<PropertyController>(PropertyController);
    propertyService = module.get<PropertyService>(PropertyService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPublicList', () => {
    it('should return public properties list', async () => {
      const mockResponse = {
        properties: [
          {
            id: '1',
            title: 'Property 1',
            description: 'Description',
            price: 100000,
            location: 'Location',
            bedrooms: 3,
            bathrooms: 2,
            area: 120,
            imageUrls: [],
            ownerId: 'owner-id',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
      };

      mockPropertyService.listPublic.mockResolvedValue(mockResponse);

      const result = await controller.getPublicList();

      expect(mockPropertyService.listPublic).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPublicOne', () => {
    it('should return property by id', async () => {
      const propertyId = 'prop-123';
      const mockProperty = {
        id: propertyId,
        title: 'Test Property',
        description: 'Description',
        price: 100000,
        location: 'Location',
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        imageUrls: [],
        ownerId: 'owner-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyService.getPublicById.mockResolvedValue(mockProperty);

      const result = await controller.getPublicOne(propertyId);

      expect(mockPropertyService.getPublicById).toHaveBeenCalledWith(propertyId);
      expect(result).toEqual(mockProperty);
    });
  });

  describe('createForAgent', () => {
    it('should create property for agent', async () => {
      const createDto = {
        title: 'New Property',
        description: 'Description',
        price: 150000,
        location: 'Location',
        bedrooms: 3,
        bathrooms: 2,
        area: 130,
        imageUrls: [],
      };

      const mockProperty = {
        id: 'new-prop-id',
        ...createDto,
        ownerId: 'agent-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyService.createForAgent.mockResolvedValue(mockProperty);

      const result = await controller.createForAgent(
        mockAgentRequest as any,
        createDto,
      );

      expect(mockPropertyService.createForAgent).toHaveBeenCalledWith(
        'agent-123',
        createDto,
      );
      expect(result).toEqual(mockProperty);
    });
  });

  describe('updateForAgent', () => {
    it('should update property for agent', async () => {
      const propertyId = 'prop-123';
      const updateDto = {
        title: 'Updated Property',
        price: 160000,
      };

      const mockProperty = {
        id: propertyId,
        title: updateDto.title,
        description: 'Description',
        price: updateDto.price,
        location: 'Location',
        bedrooms: 3,
        bathrooms: 2,
        area: 130,
        imageUrls: [],
        ownerId: 'agent-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyService.updateForAgent.mockResolvedValue(mockProperty);

      const result = await controller.updateForAgent(
        propertyId,
        mockAgentRequest as any,
        updateDto,
      );

      expect(mockPropertyService.updateForAgent).toHaveBeenCalledWith(
        propertyId,
        updateDto,
        'agent-123',
      );
      expect(result).toEqual(mockProperty);
    });
  });

  describe('removeForAgent', () => {
    it('should remove property for agent', async () => {
      const propertyId = 'prop-123';

      mockPropertyService.removeForAgent.mockResolvedValue(undefined);

      await controller.removeForAgent(propertyId, mockAgentRequest as any);

      expect(mockPropertyService.removeForAgent).toHaveBeenCalledWith(
        propertyId,
        'agent-123',
      );
    });
  });

  describe('createForAdmin', () => {
    it('should create property as admin', async () => {
      const createDto = {
        title: 'Admin Property',
        description: 'Description',
        price: 200000,
        location: 'Location',
        bedrooms: 4,
        bathrooms: 3,
        area: 180,
        imageUrls: [],
        ownerId: 'owner-id',
      };

      const mockProperty = {
        id: 'new-admin-prop-id',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyService.createForAdmin.mockResolvedValue(mockProperty);

      const result = await controller.createForAdmin(createDto);

      expect(mockPropertyService.createForAdmin).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockProperty);
    });
  });

  describe('updateForAdmin', () => {
    it('should update property as admin', async () => {
      const propertyId = 'prop-123';
      const updateDto = {
        title: 'Admin Updated',
      };

      const mockProperty = {
        id: propertyId,
        title: updateDto.title,
        description: 'Description',
        price: 200000,
        location: 'Location',
        bedrooms: 4,
        bathrooms: 3,
        area: 180,
        imageUrls: [],
        ownerId: 'owner-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyService.updateForAdmin.mockResolvedValue(mockProperty);

      const result = await controller.updateForAdmin(propertyId, updateDto);

      expect(mockPropertyService.updateForAdmin).toHaveBeenCalledWith(
        propertyId,
        updateDto,
      );
      expect(result).toEqual(mockProperty);
    });
  });

  describe('removeForAdmin', () => {
    it('should remove property as admin', async () => {
      const propertyId = 'prop-123';

      mockPropertyService.removeForAdmin.mockResolvedValue(undefined);

      await controller.removeForAdmin(propertyId);

      expect(mockPropertyService.removeForAdmin).toHaveBeenCalledWith(
        propertyId,
      );
    });
  });
});

