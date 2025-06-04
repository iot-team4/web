import { Test, TestingModule } from '@nestjs/testing';
import { AppRepository } from './app.repository';
import { PrismaService } from './prisma/prisma.service';
import { OrderBy } from './dtos/get-control-log-request-query.dto';
import { ControlAction, ControlSource, ControlTarget } from '@prisma/client';

describe('AppRepository', () => {
  let repository: AppRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    controlLog: {
      findMany: jest.fn(),
    },
    // Mock other methods if AppRepository uses them and they are not yet mocked
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<AppRepository>(AppRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getControlLogs', () => {
    const mockDate = new Date('2024-05-27T10:00:00.000Z');
    const mockLogs = [
      { id: BigInt(1), target: ControlTarget.fan, action: ControlAction.on, source: ControlSource.manual, createdAt: mockDate },
      { id: BigInt(2), target: ControlTarget.led, action: ControlAction.off, source: ControlSource.auto, createdAt: mockDate },
    ];
    const expectedMappedLogs = [
      { id: 1, target: 'fan', action: 'on', source: 'manual', createdAt: mockDate.toISOString() },
      { id: 2, target: 'led', action: 'off', source: 'auto', createdAt: mockDate.toISOString() },
    ];

    it('should call prismaService.controlLog.findMany with default limit and desc order, and return mapped logs', async () => {
      mockPrismaService.controlLog.findMany.mockResolvedValue(mockLogs);

      const limit = 20; // Default limit from GetControlLogRequestQueryDto, though repository takes it as param
      const orderBy = OrderBy.DESC;

      const result = await repository.getControlLogs(limit, orderBy);

      expect(prismaService.controlLog.findMany).toHaveBeenCalledWith({
        take: limit,
        orderBy: { createdAt: orderBy },
      });
      expect(result).toEqual(expectedMappedLogs);
    });

    it('should call prismaService.controlLog.findMany with custom limit and asc order, and return mapped logs', async () => {
      mockPrismaService.controlLog.findMany.mockResolvedValue(mockLogs);

      const limit = 10;
      const orderBy = OrderBy.ASC;

      const result = await repository.getControlLogs(limit, orderBy);

      expect(prismaService.controlLog.findMany).toHaveBeenCalledWith({
        take: limit,
        orderBy: { createdAt: orderBy },
      });
      expect(result).toEqual(expectedMappedLogs);
    });

    it('should handle empty logs from prismaService', async () => {
      mockPrismaService.controlLog.findMany.mockResolvedValue([]);

      const limit = 5;
      const orderBy = OrderBy.DESC;

      const result = await repository.getControlLogs(limit, orderBy);

      expect(prismaService.controlLog.findMany).toHaveBeenCalledWith({
        take: limit,
        orderBy: { createdAt: orderBy },
      });
      expect(result).toEqual([]);
    });
  });
});
