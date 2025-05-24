-- CreateEnum
CREATE TYPE "SensorType" AS ENUM ('temperature', 'humidity', 'pm25');

-- CreateEnum
CREATE TYPE "ControlTarget" AS ENUM ('led', 'fan', 'auto_fan');

-- CreateEnum
CREATE TYPE "ControlAction" AS ENUM ('on', 'off', 'enabled', 'disabled');

-- CreateEnum
CREATE TYPE "ControlSource" AS ENUM ('user', 'auto');

-- CreateTable
CREATE TABLE "SensorData" (
    "id" BIGSERIAL NOT NULL,
    "sensor_type" "SensorType" NOT NULL,
    "value" DECIMAL(8,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SensorData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlLog" (
    "id" BIGSERIAL NOT NULL,
    "target" "ControlTarget" NOT NULL,
    "action" "ControlAction" NOT NULL,
    "source" "ControlSource" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ControlLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorDataSummaryHourly" (
    "id" BIGSERIAL NOT NULL,
    "sensor_type" "SensorType" NOT NULL,
    "avg_value" DECIMAL(8,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SensorDataSummaryHourly_pkey" PRIMARY KEY ("id")
);
