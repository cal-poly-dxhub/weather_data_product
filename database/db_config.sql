#-------------------------------------------------------------------------------
#------------------------------------ TOWER ------------------------------------
#-------------------------------------------------------------------------------

CREATE TABLE `Tower` (
    `ArchiveNumber` SMALLINT UNSIGNED PRIMARY KEY,

    `TowerNumber` SMALLINT UNSIGNED,

    `Latitude` DOUBLE(9,6) SIGNED,

    `Longitude` DOUBLE(9,6) SIGNED,

    `MSLElevation` SMALLINT SIGNED,

    `Location` VARCHAR(256)
);


CREATE TABLE `TowerProductCode` (
    `Code` SMALLINT UNSIGNED PRIMARY KEY,

    `Description` VARCHAR(256),

    `Unit` VARCHAR(16),

    `UnitDescription` VARCHAR(256)
);


CREATE TABLE `TowerMeasurement` (
    `MeasurementID` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,

    `TowerID` SMALLINT UNSIGNED,
    
    `FileLocation` VARCHAR(128),
    
    `MeasurementDateTime` DATETIME,

    FOREIGN KEY (`TowerID`) REFERENCES Tower(`ArchiveNumber`)
);


CREATE TABLE `TowerCodeResponse` (
    `MeasurementID` INT UNSIGNED,

    `ProductCode` SMALLINT UNSIGNED,

    `HeightMeasurement` SMALLINT UNSIGNED,

    `Value` DOUBLE,

    PRIMARY KEY (`MeasurementID`, `ProductCode`, `HeightMeasurement`),
    FOREIGN KEY (`MeasurementID`) REFERENCES `TowerMeasurement`(`MeasurementID`),
    FOREIGN KEY (`ProductCode`) REFERENCES `TowerProductCode`(`Code`)
);

#-------------------------------------------------------------------------------
#---------------------------------- MiniSODAR ----------------------------------
#-------------------------------------------------------------------------------

CREATE TABLE `MiniSODARInstrument` (
    `AssetID` SMALLINT UNSIGNED PRIMARY KEY, #(integer) (nnnn)

    `TowerID` SMALLINT UNSIGNED,

    `Name` VARCHAR(64),

    FOREIGN KEY (`TowerID`) REFERENCES `Tower`(`ArchiveNumber`)
);


# A single MiniSODAR instrument measurement at a given date/time
CREATE TABLE `MiniSODARMeasurement` (
    `MeasurementID` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,

	`FileLocation` VARCHAR(128),

    `AssetID` SMALLINT UNSIGNED, #(integer) (nnnn)
    
    `MeasurementDateTime` DATETIME, #(string) (dd/mm/yyyy hh:mm:ss)
    
    `MxHeight` SMALLINT, #Mixing Height in meters (int) (nnn) [ID 0001]
    
    `UNoise` SMALLINT, #Noise level of the U measurement in millivolts (int) (nnnn) [ID 0002]
    
    `VNoise` SMALLINT, #Noise level of the V measurement in millivolts (int) (nnnn) [ID 0003]
    
    `WNoise` SMALLINT, #Noise level of the W measurement in millivolts (int) (nnnn) [ID 0004]
    
    FOREIGN KEY (`AssetID`) REFERENCES `MiniSODARInstrument`(`AssetID`)
);


# A single gate response (one of many gate measurements) originating from a MiniSODAR instrument measurement
CREATE TABLE `MiniSODARGateResponse` (
    `MeasurementID` INT UNSIGNED,
    
    `GateNum` SMALLINT UNSIGNED, #The number of this gate (integer) (nn)
    
    `HT` SMALLINT, #Sample height in meters (integer) (nnn)

    `HT_QCFLAG` BIT(3),

    `SPD` DOUBLE(4, 2), #Speed in meters per second (floating point) (nn.nn)

    `SPD_QCFLAG` BIT(3),

    `DIR` SMALLINT, #Direction in degrees (integer) (nnn)

    `DIR_QCFLAG` BIT(3),

    `GSPD` DOUBLE(4, 2), #Gust speed in meters per second (floating point) (nn.nn)

    `GSPD_QCFLAG` BIT(3),

    `GDIR` SMALLINT UNSIGNED, #Gust Direction in degrees (integer) (nnn)

    `GDIR_QCFLAG` BIT(3),

    `W` DOUBLE(3,2) SIGNED, #Vertical wind component in meters per second (signed floating point) (sn.nn)

    `W_QCFLAG` BIT(3),

    `SDW` DOUBLE(4,2), #1 minute Standard deviation of W in meters per second (floating point) (nn.nn)

    `SDW_QCFLAG` BIT(3),

    `NW` TINYINT UNSIGNED, #Number of W observations in the sample (integer) (nn)

    `NW_QCFLAG` BIT(3),

    `IW` SMALLINT, #Signal return intensity in milivolts (integer) (nnnn)

    `IW_QCFLAG` BIT(3),

    `SNRW` SMALLINT, #Signal to Noise Ratio of the W component no units (integer) (nnnn)

    `SNRW_QCFLAG` BIT(3),

    `U` DOUBLE(4,2) SIGNED, #East West wind component in meters per second (signed floating point) (snn.nn)

    `U_QCFLAG` BIT(3),

    `SDU` DOUBLE(4,2), #Standard deviation of U in meters per second (floating point) (nn.nn)

    `SDU_QCFLAG` BIT(3),

    `NU` TINYINT UNSIGNED, #Number of U observations in the sample (integer) (nn)

    `NU_QCFLAG` BIT(3),

    `IU` SMALLINT, #Signal return intensity in milivolts (integer) (nnnn)

    `IU_QCFLAG` BIT(3),

    `SNRU` SMALLINT, #Signal to Noise Ratio of the U component no units (integer) (nnnn)

    `SNRU_QCFLAG` BIT(3),

    `V` DOUBLE(4,2) SIGNED, #North South wind component in meters per second (signed floating point) (snn.nn)

    `V_QCFLAG` BIT(3),

    `SDV` DOUBLE(4,2), #Standard deviation of V in meters per second (floating point) (nn.nn)

    `SDV_QCFLAG` BIT(3),

    `NV` TINYINT UNSIGNED, #Number of V observations in the sample (integer) (nn)

    `NV_QCFLAG` BIT(3),

    `IV` SMALLINT, #Signal return intensity in milivolts (integer) (nnnn)

    `IV_QCFLAG` BIT(3),

    `SNRV` SMALLINT, #Signal to Noise Ratio of the V component no units (integer) (nnnn)

    `SNRV_QCFLAG` BIT(3),

    `SDW5` DOUBLE(4,2), #5 minute Standard deviation of W in meters per second (floating point) (nn.nn)

    `SDW5_QCFLAG` BIT(3),

    `SDW10` DOUBLE(4,2), #10 minute Standard deviation of W in meters per second (floating point) (nn.nn)

    `SDW10_QCFLAG` BIT(3),

    PRIMARY KEY (`MeasurementID`, `GateNum`),
    FOREIGN KEY (`MeasurementID`) REFERENCES `MiniSODARMeasurement`(`MeasurementID`)
);

#-------------------------------------------------------------------------------
#----------------------------------- PROFILER ----------------------------------
#-------------------------------------------------------------------------------

CREATE TABLE `ProfilerInstrument` (
    `AssetID` SMALLINT UNSIGNED PRIMARY KEY, #(integer) (nnnn)

    `TowerID` SMALLINT UNSIGNED,

    `Name` VARCHAR(64),

    FOREIGN KEY (`TowerID`) REFERENCES `Tower`(`ArchiveNumber`)
);

#-------------------------------------------------------------------------------
#-------------------------------- TEMP PROFILER --------------------------------
#-------------------------------------------------------------------------------

# A single Temperature Profiler instrument measurement at a given date/time
CREATE TABLE `TemperatureProfilerMeasurement` (
    `MeasurementID` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    
    `FileLocation` VARCHAR(128),

    `AssetID` SMALLINT UNSIGNED, #(integer) (nnnn)

    `MeasurementDateTime` DATETIME, #(string) (dd/mm/yyyy hh:mm:ss)
    
    FOREIGN KEY (`AssetID`) REFERENCES `ProfilerInstrument`(`AssetID`)
);


# A single gate response (one of many gate measurements) originating from a Temperature Profiler instrument measurement
CREATE TABLE `TemperatureProfilerGateResponse` (
    `MeasurementID` INT UNSIGNED,

    `GateNum` TINYINT UNSIGNED, #The number of this gate (integer) (nn)

    `HT` DOUBLE(5,3), #Sample height in Kilometers (floating point) (nn.nnn)

    `HT_QCFLAG` BIT(3),

    `T` DOUBLE(3,1) SIGNED, #Temperature in degrees Celsius (signed floating point) (snn.n)

    `T_QCFLAG` BIT(3),

    `Tc` DOUBLE(3,1) SIGNED, #Corrected Temperature in degrees Celsius (signed floating point) (snn.n)

    `Tc_QCFLAG` BIT(3),

    `W` DOUBLE(3,1) SIGNED, #Vertical wind component in meters per second (signed floating point) (snn.n)

    `W_QCFLAG` BIT(3),

    `SNRT` TINYINT SIGNED, #Signal to Noise Ratio of T in dB (signed integer) (snn)

    `SNRT_QCFLAG` BIT(3),

    `SNRTc` TINYINT SIGNED, #Signal to Noise Ratio of Tc in dB (signed integer) (snn)

    `SNRTc_QCFLAG` BIT(3),

    `SNRW` TINYINT SIGNED, #Signal to Noise Ratio of the W component in dB (signed integer) (snn)

    `SNRW_QCFLAG` BIT(3),

    `CNT-T` TINYINT UNSIGNED, #Number of Temperature observations in this consensus (integer) (nn)

    `CNT-T_QCFLAG` BIT(3),

    `CNT-Tc` TINYINT UNSIGNED, #Number of Corrected Temperature observations in this consensus (integer) (nn)

    `CNT-Tc_QCFLAG` BIT(3),

    `CNT-W` TINYINT UNSIGNED, #Number of W observations in this consensus (integer) (nn)

    `CNT-W_QCFLAG` BIT(3),

    PRIMARY KEY (`MeasurementID`, `GateNum`),
    FOREIGN KEY (`MeasurementID`) REFERENCES `TemperatureProfilerMeasurement`(`MeasurementID`)
);

#-------------------------------------------------------------------------------
#-------------------------------- WIND PROFILER --------------------------------
#-------------------------------------------------------------------------------

# A single Wind Profiler instrument measurement at a given date/time
CREATE TABLE `WindProfilerMeasurement` (
    `MeasurementID` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    
    `FileLocation` VARCHAR(128),

    `AssetID` SMALLINT UNSIGNED, #(integer) (nnnn)

    `MeasurementDateTime` DATETIME, #(string) (dd/mm/yyyy hh:mm:ss)

    `AZ-1` DOUBLE(4,1), #Azimuth of radial (beam) 1 – 5 (float) (nnn.n)

    `AZ-2` DOUBLE(4,1), #Azimuth of radial (beam) 1 – 5 (float) (nnn.n)

    `AZ-3` DOUBLE(4,1), #Azimuth of radial (beam) 1 – 5 (float) (nnn.n)

    `AZ-4` DOUBLE(4,1), #Azimuth of radial (beam) 1 – 5 (float) (nnn.n)

    `AZ-5` DOUBLE(4,1), #Azimuth of radial (beam) 1 – 5 (float) (nnn.n)

    `EL-1` DOUBLE(3,1), #Elevation of radial (beam) 1 – 5 (float) (nn.n)

    `EL-2` DOUBLE(3,1), #Elevation of radial (beam) 1 – 5 (float) (nn.n)

    `EL-3` DOUBLE(3,1), #Elevation of radial (beam) 1 – 5 (float) (nn.n)

    `EL-4` DOUBLE(3,1), #Elevation of radial (beam) 1 – 5 (float) (nn.n)

    `EL-5` DOUBLE(3,1), #Elevation of radial (beam) 1 – 5 (float) (nn.n)
    
    FOREIGN KEY (`AssetID`) REFERENCES `ProfilerInstrument`(`AssetID`)
);


# A single gate response (one of many gate measurements) originating from a Wind Profiler instrument measurement
CREATE TABLE `WindProfilerGateResponse` (
    `MeasurementID` INT UNSIGNED, #(string) (dd/mm/yyyy hh:mm:ss)

    `GateNum` SMALLINT UNSIGNED, #The number of this gate (integer) (nnn)

    `HT` DOUBLE(6,3), #Sample height in Kilometers (floating point) (nnn.nnn)

    `HT_QCFLAG` BIT(3),

    `SPD` DOUBLE(3,1), #Sample speed in meters per second (floating point) (nn.n)

    `SPD_QCFLAG` BIT(3),

    `DIR` SMALLINT, #Sample direction in degrees (integer) (nnn)

    `DIR_QCFLAG` BIT(3),

    `VEL-1` DOUBLE(3,1) SIGNED, #Velocity of radial (beam) 1 in meters per second (signed floating point) (snn.n)

    `VEL-1_QCFLAG` BIT(3),

    `OBS-1` TINYINT, #Number of observations in the radial (beam) 1 consensus (integer) (nn)

    `OBS-1_QCFLAG` BIT(3),

    `SNR-1` TINYINT SIGNED, #Signal to Noise Ratio of radial (beam) 1 in dB (signed integer) (snn)

    `SNR-1_QCFLAG` BIT(3),

    `VEL-2` DOUBLE(3,1) SIGNED, #Velocity of radial (beam) 2 in meters per second (signed floating point) (snn.n)

    `VEL-2_QCFLAG` BIT(3),

    `OBS-2` TINYINT, #Number of observations in the radial (beam) 2 consensus (integer) (nn)

    `OBS-2_QCFLAG` BIT(3),

    `SNR-2` TINYINT SIGNED, #Signal to Noise Ratio of radial (beam) 2 in dB (signed integer) (snn)

    `SNR-2_QCFLAG` BIT(3),

    `VEL-3` DOUBLE(3,1) SIGNED, #Velocity of radial (beam) 3 in meters per second (signed floating point) (snn.n)

    `VEL-3_QCFLAG` BIT(3),

    `OBS-3` TINYINT, #Number of observations in the radial (beam) 3 consensus (integer) (nn)

    `OBS-3_QCFLAG` BIT(3),

    `SNR-3` TINYINT SIGNED, #Signal to Noise Ratio of radial (beam) 3 in dB (integer) (snn)

    `SNR-3_QCFLAG` BIT(3),

    `VEL-4` DOUBLE(3,1) SIGNED, #Velocity of radial (beam) 4 in meters per second (signed floating point) (snn.n)

    `VEL-4_QCFLAG` BIT(3),

    `OBS-4` TINYINT, #Number of observations in the radial (beam) 4 consensus (integer) (nn)

    `OBS-4_QCFLAG` BIT(3),

    `SNR-4` TINYINT SIGNED, #Signal to Noise Ratio of radial (beam) 4 in dB (integer) (snn)

    `SNR-4_QCFLAG` BIT(3),

    `VEL-5` DOUBLE(3,1) SIGNED, #Velocity of radial (beam) 5 in meters per second (signed floating point) (snn.n)

    `VEL-5_QCFLAG` BIT(3),

    `OBS-5` TINYINT UNSIGNED, #Number of observations in the radial (beam) 5 consensus (integer) (nn)

    `OBS-5_QCFLAG` BIT(3),

    `SNR-5` TINYINT SIGNED, #Signal to Noise Ratio of radial (beam) 5 in dB (integer) (snn)

    `SNR-5_QCFLAG` BIT(3),

    PRIMARY KEY (`MeasurementID`, `GateNum`),
    FOREIGN KEY (`MeasurementID`) REFERENCES `WindProfilerMeasurement`(`MeasurementID`)
);

#-------------------------------------------------------------------------------
#------------------------------------ AMPS2 ------------------------------------
#-------------------------------------------------------------------------------
/*
CREATE TABLE `Amps2Measurements` (
   # `BalloonType` VARCHAR(16),
   
   `FileLocation` VARCHAR(128),

   # `OperationNumber` VARCHAR(16),
    
    `MeasurementDateTime` DATETIME,
    
    `GeometHeight`  MEDIUMINT UNSIGNED,
    
    `GeopotHeight` MEDIUMINT UNSIGNED,
    
    `RiseRate` DOUBLE(3,1),

    `Dir` TINYINT UNSIGNED,

    `SpeedFPS` DOUBLE(3,1),

    `SpeedKnots` DOUBLE(3,1),

    `Temp` TINYINT SIGNED,

    `Dew` TINYINT SIGNED,

    `BP` TINYINT SIGNED,

    `RH` TINYINT,

    `ABH` DOUBLE(3,2),

    `DEN` DOUBLE(5,2),

    `MIR` TINYINT,

    `OIR` TINYINT,

    `VS` TINYINT,

    `Shear` DOUBLE(4,3),

    `ShrDir` TINYINT,

    `VP` DOUBLE(3,2),

    `PW` TINYINT,

    `VX` DOUBLE(3,2),

    `VY` DOUBLE(3,2),

    `VelErr` DOUBLE(3,1),

    `Edit` TINYINT,
    
    PRIMARY KEY (`OperationNumber`, `MeasurementDateTime`),
);
*/
#-------------------------------------------------------------------------------
#------------------------------------- ASOS ------------------------------------
#-------------------------------------------------------------------------------

CREATE TABLE `AsosInstrument` (
    `AssetID` SMALLINT UNSIGNED PRIMARY KEY, #(integer) (nnnn)

    `TowerID` SMALLINT UNSIGNED,

    `Name` VARCHAR(64),

    FOREIGN KEY (`TowerID`) REFERENCES `Tower`(`ArchiveNumber`)
);


CREATE TABLE `AsosMeasurements` (
    `AssetID` SMALLINT UNSIGNED,
    
    `FileLocation` VARCHAR(128),

    `MeasurementDateTime` DATETIME,

    `asos_sky_condition_report` VARCHAR(256), #code: 1000

    `asos_sky_condition_report_QCFLAG` BIT(3),

    `asos_visibility` TINYINT, #code:1001  (integer nn) [mi]

    `asos_visibility_QCFLAG` BIT(3),

    `asos_tower_visibility` TINYINT, #code:1002 (integer nn) [mi]

    `asos_tower_visibility_QCFLAG` BIT(3),

    `asos_present_weather` VARCHAR(256), #code:1003

    `asos_present_weather_QCFLAG` BIT(3),

    `asos_urgent_weather` VARCHAR(256), #code:1004

    `asos_urgent_weather_QCFLAG` BIT(3),

    `asos_sea_level_pressure` DOUBLE(5,1), #code:1005 (floating point) (nnnn.n) [mb]

    `asos_sea_level_pressure_QCFLAG` BIT(3),

    `asos_dew_point` DOUBLE(4,1), #code:1007 (floating point) (nnn.n) [F]

    `asos_dew_point_QCFLAG` BIT(3),

    `asos_relative_humidity` SMALLINT, #code:1008 (integer nnn) [%]

    `asos_relative_humidity_QCFLAG` BIT(3),

    `asos_wind_direction` SMALLINT, #code:1009 (integer nnn) [deg]

    `asos_wind_direction_QCFLAG` BIT(3),

    `asos_wind_speed`  TINYINT, #code:1010 (integer nn) [knots]

    `asos_wind_speed_QCFLAG` BIT(3),
    
    `asos_magnetic_wind_direction` SMALLINT, #code:1011 (integer nnn) [deg]

    `asos_magnetic_wind_direction_QCFLAG` BIT(3),

    `asos_magnetic_wind_speed` SMALLINT, #code:1012 (integer nn) [knots]

    `asos_magnetic_wind_speed_QCFLAG` BIT(3),

    `asos_altimeter_pressure_setting` DOUBLE(4,2), #code:1013 (floating point) (nn.nn) [inHg]

    `asos_altimeter_pressure_setting_QCFLAG` BIT(3),

    `asos_density_altitude` SMALLINT, #code:1014 (integer nnnn) [ft]

    `asos_density_altitude_QCFLAG` BIT(3),

    `asos_pressure_altitude` SMALLINT, #code:1015 (integer nnnn) [ft]

    `asos_pressure_altitude_QCFLAG` BIT(3),

    `asos_remark` VARCHAR(256), #code:1016

    `asos_remark_QCFLAG` BIT(3),

    `asos_rain_rate` DOUBLE(3,1), #code:1018 (floating point) (nn.n) [in / hr]

    `asos_rain_rate_QCFLAG` BIT(3),
    
    `asos_temperature` DOUBLE(4,1), #code:1020 (floating point) (nnn.n) [F]

    `asos_temperature_QCFLAG` BIT(3),
    
    PRIMARY KEY(`AssetID`, `MeasurementDateTime`),
    
    FOREIGN KEY (`AssetID`) REFERENCES `AsosInstrument`(`AssetID`)
);