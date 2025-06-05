import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '@src/app.service';
import { AppRepository } from '@src/app.repository';
import { SensorType } from '@prisma/client';
import { SensorQueryRange } from '@src/enums/sensor-query-range.enum.ts';
import { FrontendGateway } from '@src/gateway/frontend.gateway';

// Mock AppRepository
const mockAppRepository = {
  getSensorSummary: jest.fn(),
  // Mock other AppRepository methods if AppService calls them
};

// Mock FrontendGateway
const mockFrontendGateway = {
  sensorUpdate: jest.fn(),
  // Mock other FrontendGateway methods if AppService calls them
};

describe('AppService', () => {
  let service: AppService;
  let repositoryMock: typeof mockAppRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: AppRepository,
          useValue: mockAppRepository,
        },
        {
          provide: FrontendGateway, // AppService depends on FrontendGateway
          useValue: mockFrontendGateway,
        }
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    repositoryMock = module.get(AppRepository);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe('getSensorSummary', () => {
    it('should call repository.getSensorSummary with correct parameters and return its result', async () => {
      const sensorType = SensorType.temperature;
      const range = SensorQueryRange.SEVEN_D;
      const mockRepoResult = [
        { createdAt: '2023-01-01T00:00:00.000Z', avgValue: 22.5 },
        { createdAt: '2023-01-01T01:00:00.000Z', avgValue: 23.0 },
      ];

      repositoryMock.getSensorSummary.mockResolvedValue(mockRepoResult);

      const result = await service.getSensorSummary(sensorType, range);

      expect(repositoryMock.getSensorSummary).toHaveBeenCalledTimes(1);
      expect(repositoryMock.getSensorSummary).toHaveBeenCalledWith(sensorType, range);
      expect(result).toEqual(mockRepoResult);
    });

    it('should handle empty result from repository', async () => {
      const sensorType = SensorType.pm25;
      const range = SensorQueryRange.TWENTY_FOUR_H;
      const mockRepoResultEmpty: any[] = [];

      repositoryMock.getSensorSummary.mockResolvedValue(mockRepoResultEmpty);

      const result = await service.getSensorSummary(sensorType, range);

      expect(repositoryMock.getSensorSummary).toHaveBeenCalledWith(sensorType, range);
      expect(result).toEqual(mockRepoResultEmpty);
    });
  });
});
