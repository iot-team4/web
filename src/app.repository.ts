import { Injectable } from '@nestjs/common';
import { ControlAction, ControlTarget, SensorData, SensorType } from '@prisma/client';
import { ControlPartsLogDto } from '@src/dtos/control-parts-log.dto';
import { OrderBy } from '@src/dtos/get-control-log-request-query.dto';
import { SensorDataDto } from '@src/dtos/sensor-data.dto';
import { AutoFanAction, TargetType } from '@src/enums/control-parts.enum';
import { SensorQueryRange } from '@src/enums/sensor-query-range.enum.ts';
import { PrismaService } from '@src/prisma/prisma.service';
import { Prisma } from '@prisma/client'; // Required for $queryRaw

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

  getHello(): string {
    return 'Hello World!';
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

  async getSensorSummary(
    sensorType: SensorType,
    range: SensorQueryRange,
  ): Promise<{ createdAt: string; avgValue: number }[]> {
    let startDate: Date;
    const now = new Date();

    if (range === SensorQueryRange.TWENTY_FOUR_H) {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (range === SensorQueryRange.SEVEN_D) {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      // Should not happen due to enum validation, but as a fallback:
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const result: { createdAtHour: Date; avgValue: Prisma.Decimal }[] =
      await this.prismaService.$queryRaw`
      SELECT
        DATE_TRUNC('hour', "created_at") AS "createdAtHour",
        AVG("value") AS "avgValue"
      FROM
        "SensorData"
      WHERE
        "sensor_type" = ${sensorType.toString()}::"SensorType" AND "created_at" >= ${startDate}
      GROUP BY
        "createdAtHour"
      ORDER BY
        "createdAtHour" ASC
    `;

    return result.map((row) => ({
      createdAt: row.createdAtHour.toISOString(),
      avgValue: Number(row.avgValue),
    }));
  }
}
