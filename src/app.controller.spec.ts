import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PiGateway } from './gateway/pi.gateway';
import { AppRepository } from './app.repository';
import { PrismaService } from './prisma/prisma.service';
import { ControlAction, ControlSource, ControlTarget } from '@prisma/client';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        AppRepository,
        PrismaService,
        {
          provide: PiGateway,
          useValue: {
            sendCommandToPi: jest.fn(),
            // ensure all methods used by AppService that interact with PiGateway are mocked if AppService is not fully mocked
          },
        },
        // If AppService methods called by AppController are not going to be mocked,
        // AppService's dependencies like FrontendGateway might also need to be mocked.
        // For this specific test, we will mock appService.getLatestControlLogs directly.
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  describe('getLatestControlLogs', () => {
    it('should return latest logs for all targets', async () => {
      const mockLogs = [
        { id: 1, target: ControlTarget.led, action: ControlAction.on, source: ControlSource.user, createdAt: new Date('2023-01-01T10:00:00Z').toISOString() },
        { id: 2, target: ControlTarget.fan, action: ControlAction.off, source: ControlSource.auto, createdAt: new Date('2023-01-01T11:00:00Z').toISOString() },
        { id: 3, target: ControlTarget.auto_fan, action: ControlAction.enabled, source: ControlSource.user, createdAt: new Date('2023-01-01T12:00:00Z').toISOString() },
      ];
      jest.spyOn(appService, 'getLatestControlLogs').mockResolvedValue(mockLogs);

      const result = await appController.getLatestControlLogs();
      expect(result).toHaveLength(3);
      expect(result).toEqual(mockLogs);
      // Specific checks for latest can be tricky without more context on how "latest" is determined by the service method itself
      // The mock directly provides what's considered "latest" for this test.
    });

    it('should handle targets with no logs', async () => {
      const mockLogs = [
        // No log for 'led'
        { id: 2, target: ControlTarget.fan, action: ControlAction.on, source: ControlSource.user, createdAt: new Date('2023-01-01T10:00:00Z').toISOString() },
        { id: 3, target: ControlTarget.auto_fan, action: ControlAction.disabled, source: ControlSource.auto, createdAt: new Date('2023-01-01T11:00:00Z').toISOString() },
      ];
      jest.spyOn(appService, 'getLatestControlLogs').mockResolvedValue(mockLogs);

      const result = await appController.getLatestControlLogs();
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockLogs);
    });

    it('should handle empty database (no logs for any target)', async () => {
      const mockLogs = [];
      jest.spyOn(appService, 'getLatestControlLogs').mockResolvedValue(mockLogs);

      const result = await appController.getLatestControlLogs();
      expect(result).toHaveLength(0);
      expect(result).toEqual(mockLogs);
    });
  });
});
