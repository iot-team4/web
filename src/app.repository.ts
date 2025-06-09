import { Injectable } from '@nestjs/common';
import { ControlAction, ControlTarget, SensorData, SensorType } from '@prisma/client';
import { ControlPartsLogDto } from '@src/dtos/control-parts-log.dto';
import { OrderBy } from '@src/dtos/get-control-log-request-query.dto';
import { SensorDataDto } from '@src/dtos/sensor-data.dto';
import { AutoFanAction, TargetType } from '@src/enums/control-parts.enum';
import { PrismaService } from '@src/prisma/prisma.service';

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
  ): Promise<
    {
      id: number;
      target: string;
      action: string;
      source: string;
      createdAt: string;
    }[]
  > {
    const logs = await this.prismaService.controlLog.findMany({
      take: limit,
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
}
