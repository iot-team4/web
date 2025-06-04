import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { AppRepository } from './app.repository';
import { FrontendGateway } from './gateway/frontend.gateway';
import { GetControlLogRequestQueryDto, OrderBy } from './dtos/get-control-log-request-query.dto';

describe('AppService', () => {
  let service: AppService;
  let repository: AppRepository;

  const mockAppRepository = {
    getControlLogs: jest.fn(),
    // Mock other methods if AppService uses them and they are not yet mocked
    createSensorData: jest.fn(),
    getLastSensorData: jest.fn(),
    createPartControlLog: jest.fn(),
    getHello: jest.fn(),
  };

  const mockFrontendGateway = {
    sensorUpdate: jest.fn(),
    // Mock other methods if AppService uses them
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: AppRepository,
          useValue: mockAppRepository,
        },
        {
          provide: FrontendGateway,
          useValue: mockFrontendGateway,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    repository = module.get<AppRepository>(AppRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getControlLogs', () => {
    it('should call appRepository.getControlLogs with parameters from DTO and return its result', async () => {
      const dto = new GetControlLogRequestQueryDto();
      dto.limit = 10;
      dto.orderBy = OrderBy.ASC;

      const expectedResult = [{ id: 1, target: 'fan', action: 'on', source: 'auto', createdAt: new Date().toISOString() }];
      mockAppRepository.getControlLogs.mockResolvedValue(expectedResult);

      const result = await service.getControlLogs(dto);

      expect(repository.getControlLogs).toHaveBeenCalledWith(dto.limit, dto.orderBy);
      expect(result).toEqual(expectedResult);
    });

    it('should call appRepository.getControlLogs with default DTO parameters if not provided', async () => {
      const dto = new GetControlLogRequestQueryDto();
      // Defaults are limit = 20, orderBy = OrderBy.DESC

      const expectedResult = [{ id: 2, target: 'led', action: 'off', source: 'manual', createdAt: new Date().toISOString() }];
      mockAppRepository.getControlLogs.mockResolvedValue(expectedResult);

      const result = await service.getControlLogs(dto);

      expect(repository.getControlLogs).toHaveBeenCalledWith(20, OrderBy.DESC);
      expect(result).toEqual(expectedResult);
    });
  });
});
