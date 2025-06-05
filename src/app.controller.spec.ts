import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '@src/app.controller';
import { AppService } from '@src/app.service';
import { GetSensorSummaryQueryDto } from '@src/dtos/get-sensor-summary-query.dto';
import { SensorType } from '@prisma/client';
import { SensorQueryRange } from '@src/enums/sensor-query-range.enum.ts';
import { PiGateway } from '@src/gateway/pi.gateway'; // AppController depends on PiGateway

// Mock AppService
const mockAppService = {
  getSensorSummary: jest.fn(),
  // Mock other AppService methods if AppController calls them
  getHello: jest.fn(),
  createSensorData: jest.fn(),
  getAllLastSensorData: jest.fn(),
  createPartControlLog: jest.fn(),
  getControlLogs: jest.fn(),
};

// Mock PiGateway
const mockPiGateway = {
  sendCommandToPi: jest.fn(),
  // Mock other PiGateway methods if AppController calls them
};

describe('AppController', () => {
  let controller: AppController;
  let serviceMock: typeof mockAppService;

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
    serviceMock = module.get(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe('getSensorSummary', () => {
    it('should call service.getSensorSummary with correct parameters from DTO and return its result', () => {
      const queryDto = new GetSensorSummaryQueryDto();
      queryDto.sensorType = SensorType.humidity;
      queryDto.range = SensorQueryRange.SEVEN_D;

      const mockServiceResult = [
        { createdAt: '2023-01-01T00:00:00.000Z', avgValue: 50.0 },
        { createdAt: '2023-01-01T01:00:00.000Z', avgValue: 55.5 },
      ];

      serviceMock.getSensorSummary.mockReturnValue(mockServiceResult); // Can be sync if service method isn't always async in mock

      const result = controller.getSensorSummary(queryDto);

      expect(serviceMock.getSensorSummary).toHaveBeenCalledTimes(1);
      expect(serviceMock.getSensorSummary).toHaveBeenCalledWith(
        queryDto.sensorType,
        queryDto.range,
      );
      expect(result).toEqual(mockServiceResult);
    });

    it('should use default range from DTO if range is not provided', () => {
      const queryDto = new GetSensorSummaryQueryDto();
      queryDto.sensorType = SensorType.temperature;
      // queryDto.range is not set, so default SensorQueryRange.TWENTY_FOUR_H should be used

      const mockServiceResult: any[] = [];
      serviceMock.getSensorSummary.mockReturnValue(mockServiceResult);

      const result = controller.getSensorSummary(queryDto);

      expect(serviceMock.getSensorSummary).toHaveBeenCalledTimes(1);
      expect(serviceMock.getSensorSummary).toHaveBeenCalledWith(
        queryDto.sensorType,
        SensorQueryRange.TWENTY_FOUR_H, // Default value
      );
      expect(result).toEqual(mockServiceResult);
    });
  });
});
