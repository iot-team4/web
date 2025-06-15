import { Injectable } from '@nestjs/common';
import { ControlAction, ControlTarget, SensorData, SensorType } from '@prisma/client';
import { ControlLogResponseDto } from '@src/dtos/control-log-response.dto';
import { ControlPartsLogDto } from '@src/dtos/control-parts-log.dto';
import { OrderBy } from '@src/dtos/get-control-log-request-query.dto';
import { SensorDataDto } from '@src/dtos/sensor-data.dto';
import { AutoFanAction, TargetType } from '@src/enums/control-parts.enum';
import { SensorQueryRange } from '@src/enums/sensor-query-range.enum';
import { PrismaService } from '@src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AppRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createSensorData(sensorData: SensorDataDto): Promise<SensorData> {
    return await this.prismaService.sensorData.create({
      data: {
        sensorType: sensorData.sensorType,
        value: sensorData.value,
        createdAt: sensorData.createdAt,
      },
    });
  }

  async getLastSensorData(sensorType: SensorType): Promise<SensorData | null> {
    return await this.prismaService.sensorData.findFirst({
      where: {
        sensorType,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createPartControlLog(controlPartsLog: ControlPartsLogDto) {
    let target: ControlTarget;
    let action: ControlAction;

    if (controlPartsLog.target === TargetType.AUTO_FAN) {
      target = ControlTarget.auto_fan;

      if (controlPartsLog.action === AutoFanAction.ENABLE) action = ControlAction.enabled;
      else if (controlPartsLog.action === AutoFanAction.DISABLE) {
        action = ControlAction.disabled;
      }
    } else {
      target = controlPartsLog.target === TargetType.LED ? ControlTarget.led : ControlTarget.fan;

      if (controlPartsLog.action === 'on') action = ControlAction.on;
      else if (controlPartsLog.action === 'off') action = ControlAction.off;
    }

    return await this.prismaService.controlLog.create({
      data: {
        action,
        target,
        source: controlPartsLog.source,
        createdAt: controlPartsLog.createdAt,
      },
    });
  }

  async getControlLogs(
    limit: number,
    orderBy: OrderBy,
    offset: number,
  ): Promise<ControlLogResponseDto[]> {
    const logs = await this.prismaService.controlLog.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: orderBy,
      },
    });

    return logs.map((log) => ({
      id: Number(log.id),
      target: log.target,
      action: log.action,
      source: log.source,
      createdAt: log.createdAt.toISOString(),
    }));
  }

  async getLatestControlLogs(): Promise<ControlLogResponseDto[]> {
    const targets = [ControlTarget.led, ControlTarget.fan, ControlTarget.auto_fan];
    const latestLogs = [];

    for (const target of targets) {
      const log = await this.prismaService.controlLog.findFirst({
        where: { target },
        orderBy: { createdAt: 'desc' },
      });

      if (log) {
        latestLogs.push({
          id: Number(log.id),
          target: log.target,
          action: log.action,
          source: log.source,
          createdAt: log.createdAt.toISOString(),
        });
      }
    }

    return latestLogs;
  }

  async saveHourlySensorSummaries(
    summaries: Array<{ hour: Date; sensorType: SensorType; trimmedMean: number }>,
  ): Promise<void> {
    const dataToSave = summaries.map((summary) => ({
      createdAt: summary.hour,
      sensorType: summary.sensorType,
      avgValue: Number(summary.trimmedMean.toFixed(2)), // 소수점 두 자리로 반올림하여 전달
    }));

    await this.prismaService.sensorDataSummaryHourly.createMany({
      data: dataToSave,
      skipDuplicates: true,
    });
  }

  async getSensorSummary(
    sensorType: SensorType,
    range: SensorQueryRange,
  ): Promise<{ createdAt: string; avgValue: number }[]> {
    let startDate: Date;
    const now = new Date();

    if (range === SensorQueryRange.SEVEN_D) {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const result: { createdAt: Date; avgValue: Prisma.Decimal }[] =
      await this.prismaService.sensorDataSummaryHourly.findMany({
        where: {
          sensorType,
          createdAt: {
            gte: startDate,
            lte: now,
          },
        },
      });

    return result.map((row) => ({
      createdAt: row.createdAt.toISOString(),
      avgValue: Number(row.avgValue),
    }));
  }
}
