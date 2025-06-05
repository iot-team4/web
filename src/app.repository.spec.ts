import { Test, TestingModule } from '@nestjs/testing';
import { AppRepository } from '@src/app.repository';
import { PrismaService } from '@src/prisma/prisma.service';
import { SensorType } from '@prisma/client';
import { SensorQueryRange } from '@src/enums/sensor-query-range.enum.ts';
import { Prisma } from '@prisma/client'; // For Prisma.Decimal

describe('AppRepository', () => {
  let repository: AppRepository;
  let prismaServiceMock: DeepMocked<PrismaService>;

  // Helper type for deep mocking
  type DeepMocked<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any
      ? jest.MockedFunction<T[K]>
      : DeepMocked<T[K]>;
  } & T;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppRepository,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
            // Mock other PrismaService methods if needed by other repository methods
          },
        },
      ],
    }).compile();

    repository = module.get<AppRepository>(AppRepository);
    prismaServiceMock = module.get(PrismaService) as DeepMocked<PrismaService>;
  });

  afterEach(() => {
    jest.useRealTimers(); // Reset timers after each test
  });

  describe('getSensorSummary', () => {
    const mockRawData = [
      { createdAtHour: new Date('2023-01-01T10:00:00.000Z'), avgValue: new Prisma.Decimal(25.5) },
      { createdAtHour: new Date('2023-01-01T11:00:00.000Z'), avgValue: new Prisma.Decimal(26.0) },
    ];
    const expectedTransformedData = [
      { createdAt: '2023-01-01T10:00:00.000Z', avgValue: 25.5 },
      { createdAt: '2023-01-01T11:00:00.000Z', avgValue: 26.0 },
    ];

    it('should call $queryRaw and transform data for 24h range', async () => {
      jest.useFakeTimers();
      const fakeNow = new Date('2023-01-02T12:00:00.000Z');
      jest.setSystemTime(fakeNow);

      prismaServiceMock.$queryRaw.mockResolvedValue(mockRawData as any);

      const result = await repository.getSensorSummary(
        SensorType.temperature,
        SensorQueryRange.TWENTY_FOUR_H,
      );

      expect(prismaServiceMock.$queryRaw).toHaveBeenCalledTimes(1);
      const [queryTemplate, sensorTypeArg, startDateArg] = prismaServiceMock.$queryRaw.mock.calls[0];

      expect(sensorTypeArg).toBe(SensorType.temperature.toString());
      // Check if startDateArg is approximately 24 hours before fakeNow
      const expectedStartDate24h = new Date(fakeNow.getTime() - 24 * 60 * 60 * 1000);
      expect(startDateArg).toBeInstanceOf(Date);
      expect((startDateArg as Date).getTime()).toBeCloseTo(expectedStartDate24h.getTime());

      expect(result).toEqual(expectedTransformedData);
    });

    it('should call $queryRaw and transform data for 7d range', async () => {
      jest.useFakeTimers();
      const fakeNow = new Date('2023-01-08T12:00:00.000Z');
      jest.setSystemTime(fakeNow);

      prismaServiceMock.$queryRaw.mockResolvedValue(mockRawData as any);

      const result = await repository.getSensorSummary(
        SensorType.humidity,
        SensorQueryRange.SEVEN_D,
      );

      expect(prismaServiceMock.$queryRaw).toHaveBeenCalledTimes(1);
      const [queryTemplate, sensorTypeArg, startDateArg] = prismaServiceMock.$queryRaw.mock.calls[0];

      expect(sensorTypeArg).toBe(SensorType.humidity.toString());
      // Check if startDateArg is approximately 7 days before fakeNow
      const expectedStartDate7d = new Date(fakeNow.getTime() - 7 * 24 * 60 * 60 * 1000);
      expect(startDateArg).toBeInstanceOf(Date);
      expect((startDateArg as Date).getTime()).toBeCloseTo(expectedStartDate7d.getTime());

      expect(result).toEqual(expectedTransformedData);
    });

    it('should correctly transform multiple data points', async () => {
      const moreMockData = [
        { createdAtHour: new Date('2023-01-01T00:00:00.000Z'), avgValue: new Prisma.Decimal(10) },
        { createdAtHour: new Date('2023-01-01T01:00:00.000Z'), avgValue: new Prisma.Decimal(12.34) },
        { createdAtHour: new Date('2023-01-01T02:00:00.000Z'), avgValue: new Prisma.Decimal(15.000) },
      ];
      const expectedMoreTransformedData = [
        { createdAt: '2023-01-01T00:00:00.000Z', avgValue: 10 },
        { createdAt: '2023-01-01T01:00:00.000Z', avgValue: 12.34 },
        { createdAt: '2023-01-01T02:00:00.000Z', avgValue: 15 },
      ];
      jest.useFakeTimers();
      jest.setSystemTime(new Date()); // Current time doesn't matter as much for this test

      prismaServiceMock.$queryRaw.mockResolvedValue(moreMockData as any);

      const result = await repository.getSensorSummary(
        SensorType.pm25,
        SensorQueryRange.TWENTY_FOUR_H,
      );
      expect(result).toEqual(expectedMoreTransformedData);
    });

     it('should use 24h range as fallback if range is not TWENTY_FOUR_H or SEVEN_D', async () => {
      jest.useFakeTimers();
      const fakeNow = new Date('2023-01-02T12:00:00.000Z');
      jest.setSystemTime(fakeNow);

      prismaServiceMock.$queryRaw.mockResolvedValue(mockRawData as any);

      // Use an invalid range (cast to any to bypass type checking for test)
      const result = await repository.getSensorSummary(
        SensorType.temperature,
        'INVALID_RANGE' as any,
      );

      expect(prismaServiceMock.$queryRaw).toHaveBeenCalledTimes(1);
      const [, , startDateArg] = prismaServiceMock.$queryRaw.mock.calls[0];

      const expectedStartDate24h = new Date(fakeNow.getTime() - 24 * 60 * 60 * 1000);
      expect(startDateArg).toBeInstanceOf(Date);
      expect((startDateArg as Date).getTime()).toBeCloseTo(expectedStartDate24h.getTime());

      expect(result).toEqual(expectedTransformedData);
    });
  });
});
