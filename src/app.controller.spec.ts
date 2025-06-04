import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PiGateway } from './gateway/pi.gateway';
import { GetControlLogRequestQueryDto, OrderBy } from './dtos/get-control-log-request-query.dto';
import { ArgumentCaptor } from '@jest-mock/express'; // Helper for capturing DTO argument

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  const mockAppService = {
    getControlLogs: jest.fn(),
    // Mock other methods if AppController uses them and they are not yet mocked
    getHello: jest.fn(),
    createSensorData: jest.fn(),
    getAllLastSensorData: jest.fn(),
    createPartControlLog: jest.fn(),
  };

  const mockPiGateway = {
    sendCommandToPi: jest.fn(),
    // Mock other methods if AppController uses them
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
        {
          provide: PiGateway,
          useValue: mockPiGateway,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getControlLogs', () => {
    it('should call appService.getControlLogs with DTO from query parameters and return its result', async () => {
      const queryDto = new GetControlLogRequestQueryDto();
      queryDto.limit = 10;
      queryDto.orderBy = OrderBy.ASC;

      const expectedResult = [{ id: 1, target: 'fan', action: 'on', source: 'auto', createdAt: new Date().toISOString() }];
      mockAppService.getControlLogs.mockResolvedValue(expectedResult);

      // Simulate how NestJS would pass the DTO based on query params
      const result = await controller.getControlLogs(queryDto);

      expect(service.getControlLogs).toHaveBeenCalledWith(queryDto);
      // It's important to check the properties of the DTO passed to the service
      const dtoCaptor = ArgumentCaptor.forClass(GetControlLogRequestQueryDto).captures(mockAppService.getControlLogs.mock.calls[0][0]);
      expect(dtoCaptor.value.limit).toBe(10);
      expect(dtoCaptor.value.orderBy).toBe(OrderBy.ASC);
      expect(result).toEqual(expectedResult);
    });

    it('should call appService.getControlLogs with default DTO values if no query parameters are provided', async () => {
      // NestJS will instantiate the DTO with defaults if class-validator decorators and default initializers are set correctly
      const queryDtoWithDefaults = new GetControlLogRequestQueryDto();
      // queryDtoWithDefaults.limit will be 20
      // queryDtoWithDefaults.orderBy will be OrderBy.DESC

      const expectedResult = [{ id: 2, target: 'led', action: 'off', source: 'manual', createdAt: new Date().toISOString() }];
      mockAppService.getControlLogs.mockResolvedValue(expectedResult);

      const result = await controller.getControlLogs(queryDtoWithDefaults);

      expect(service.getControlLogs).toHaveBeenCalledWith(queryDtoWithDefaults);
      // Check the DTO properties
      const dtoCaptor = ArgumentCaptor.forClass(GetControlLogRequestQueryDto).captures(mockAppService.getControlLogs.mock.calls[0][0]);
      expect(dtoCaptor.value.limit).toBe(20); // Default value
      expect(dtoCaptor.value.orderBy).toBe(OrderBy.DESC); // Default value
      expect(result).toEqual(expectedResult);
    });
  });
});
