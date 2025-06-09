import { Injectable } from '@nestjs/common';
import { SensorType } from '@prisma/client';
import { AppRepository } from '@src/app.repository';
import { ControlPartsLogDto } from '@src/dtos/control-parts-log.dto';
import { ControlPartsDto } from '@src/dtos/control-parts.dto';
import { createSensorDataRequestBodyDto } from '@src/dtos/create-sensor-data-request-body.dto';
import { GetControlLogRequestQueryDto } from '@src/dtos/get-control-log-request-query.dto';
import { SensorDataDto } from '@src/dtos/sensor-data.dto';
import { SensorQueryRange } from '@src/enums/sensor-query-range.enum';
import { FrontendGateway } from '@src/gateway/frontend.gateway';

@Injectable()
export class AppService {
  constructor(
    private readonly appRepository: AppRepository,
    private readonly frontendGateway: FrontendGateway,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async createSensorData(createSensorDataRequestBody: createSensorDataRequestBodyDto) {
    const sensorData = new SensorDataDto(
      createSensorDataRequestBody.sensorType,
      createSensorDataRequestBody.value,
    );

    this.frontendGateway.sensorUpdate(sensorData);
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

  async getControlLogs(getControlLogRequestQueryDto: GetControlLogRequestQueryDto) {
    return await this.appRepository.getControlLogs(
      getControlLogRequestQueryDto.limit,
      getControlLogRequestQueryDto.orderBy,
    );
  }

  async getSensorSummary(sensorType: SensorType, range: SensorQueryRange) {
    return this.appRepository.getSensorSummary(sensorType, range);
  }
}
