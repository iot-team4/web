import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from '@src/app.service';
import { ControlPartsRequestBodyDto } from '@src/dtos/control-by-target-request-body.dto';
import { createSensorDataRequestBodyDto } from '@src/dtos/create-sensor-data-request-body.dto';
import { PiGateway } from '@src/gateway/pi.gateway';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly piGateway: PiGateway,
  ) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('sensors')
  createSensorData(@Body() createSensorDataRequestBody: createSensorDataRequestBodyDto) {
    return this.appService.createSensorData(createSensorDataRequestBody);
  }

  @Get('sensors/latest')
  getAllLastSensorData() {
    return this.appService.getAllLastSensorData();
  }

  @Post('control')
  async control(@Body() controlPartsRequestBody: ControlPartsRequestBodyDto) {
    this.piGateway.sendCommandToPi(controlPartsRequestBody);
    await this.appService.createPartControlLog(controlPartsRequestBody);
    return { status: controlPartsRequestBody.action };
  }
}
