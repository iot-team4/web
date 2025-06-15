import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SensorType } from '@prisma/client'; // Ensure SensorType is imported
import { AppRepository } from '@src/app.repository';
import { ControlLogResponseDto } from '@src/dtos/control-log-response.dto';
import { ControlPartsLogDto } from '@src/dtos/control-parts-log.dto';
import { ControlPartsDto } from '@src/dtos/control-parts.dto';
import { createSensorDataRequestBodyDto } from '@src/dtos/create-sensor-data-request-body.dto';
import { GetControlLogRequestQueryDto } from '@src/dtos/get-control-log-request-query.dto';
import { SensorDataDto } from '@src/dtos/sensor-data.dto';
import { SensorQueryRange } from '@src/enums/sensor-query-range.enum';
import { FrontendGateway } from '@src/gateway/frontend.gateway';

@Injectable()
export class AppService {
  private sensorDataBuffer: Record<SensorType, number[]>;

  constructor(
    private readonly appRepository: AppRepository,
    private readonly frontendGateway: FrontendGateway,
  ) {
    this.sensorDataBuffer = {} as Record<SensorType, number[]>;
    for (const type of Object.values(SensorType)) {
      this.sensorDataBuffer[type] = [];
    }
  }

  getHello(): string {
    return 'Hello World!';
  }

  async createSensorData(createSensorDataRequestBody: createSensorDataRequestBodyDto) {
    const sensorData = new SensorDataDto(
      createSensorDataRequestBody.sensorType,
      createSensorDataRequestBody.value,
    );

    this.frontendGateway.sensorUpdate(sensorData);
    this.sensorDataBuffer[sensorData.sensorType].push(Number(sensorData.value)); // 버퍼에 데이터 저장
    return await this.appRepository.createSensorData(sensorData);
  }

  async getAllLastSensorData() {
    const sensorTypes = Object.values(SensorType);

    return Promise.all(
      sensorTypes.map((sensorType) => this.appRepository.getLastSensorData(sensorType)),
    );
  }

  async createPartControlLog(controlParts: ControlPartsDto) {
    const log = new ControlPartsLogDto(controlParts);

    return await this.appRepository.createPartControlLog(log);
  }

  async getControlLogs(
    getControlLogRequestQueryDto: GetControlLogRequestQueryDto,
  ): Promise<ControlLogResponseDto[]> {
    return await this.appRepository.getControlLogs(
      getControlLogRequestQueryDto.limit,
      getControlLogRequestQueryDto.orderBy,
      getControlLogRequestQueryDto.offset,
    );
  }

  async getLatestControlLogs(): Promise<ControlLogResponseDto[]> {
    return await this.appRepository.getLatestControlLogs();
  }

  async getSensorSummary(sensorType: SensorType, range: SensorQueryRange) {
    return this.appRepository.getSensorSummary(sensorType, range);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async calculateAndStoreHourlyAverage() {
    console.log('시간별 센서 데이터 평균 계산 시작:', new Date().toISOString());

    const currentHour = new Date();
    currentHour.setMinutes(0);
    currentHour.setSeconds(0);
    currentHour.setMilliseconds(0);
    const summariesToSave: { hour: Date; sensorType: SensorType; trimmedMean: number }[] = [];

    for (const sensorType of Object.values(SensorType)) {
      const values = this.sensorDataBuffer[sensorType] || [];
      const sum = values.reduce((acc, v) => acc + v, 0);
      const avg = values.length > 0 ? sum / values.length : 0; // Handle division by zero

      summariesToSave.push({ hour: currentHour, sensorType, trimmedMean: avg });
      this.sensorDataBuffer[sensorType] = [];
      console.log(
        `센서 ${sensorType}의 ${currentHour.toISOString()} 시간대 평균: ${avg.toFixed(2)} (데이터 ${values.length}개)`,
      );
    }

    if (summariesToSave.length > 0) {
      await this.appRepository.saveHourlySensorSummaries(summariesToSave);
      console.log(`${summariesToSave.length}개의 시간별 평균이 저장되었습니다.`);
      return { message: '시간별 평균이 계산되어 저장되었습니다.', count: summariesToSave.length };
    }

    console.log('저장할 요약 데이터가 없습니다.');
    return { message: '저장할 요약 데이터가 없습니다.', count: 0 };
  }
}
