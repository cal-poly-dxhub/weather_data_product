/*
CREATE TABLE TowerProductCode (
    Code INT,
    Description VARCHAR(256) NOT NULL,
    Unit VARCHAR(16),
    UnitDescription VARCHAR(256),

    PRIMARY KEY (Code)
);

CREATE TABLE Tower (
    TowerNumber INT,
    ArchiveNumber INT,
    Latitude DOUBLE,
    Longitude DOUBLE,
    MSLElevation INT,
    Location VARCHAR(256),
);
*/

CREATE TABLE `TowerMeasurements` (
    `TowerID` SMALLINT UNSIGNED,
    
    `MeasurementDate` DATE,
    
    `MeasurementTime` TIME,
    
    `ProductCode` SMALLINT UNSIGNED NOT NULL,
    
    `HeightMeasurement` SMALLINT UNSIGNED NOT NULL,
    
    `Value` SMALLINT,

    PRIMARY KEY (`TowerId`, `MeasurementDate`, `MeasurementTime`)
);

#optimize data types where applicable
#abstract MxHeight->WNoise attributes to separate table to reduce data duplication? foreign key: (AssetId, MeasurementDateTime)

CREATE TABLE `MiniSODARMeasurements` (
    `AssetId` SMALLINT UNSIGNED, #(integer) (nnnn)
    
    `MeasurementDateTime` DATETIME, #(string) (dd/mm/yyyy hh:mm:ss)
    
    `MxHeight` SMALLINT, #Mixing Height in meters (int) (nnn) [ID 0001]
    
    `UNoise` SMALLINT, #Noise level of the U measurement in millivolts (int) (nnnn) [ID 0002]
    
    `VNoise` SMALLINT, #Noise level of the V measurement in millivolts (int) (nnnn) [ID 0003]
    
    `WNoise` SMALLINT, #Noise level of the W measurement in millivolts (int) (nnnn) [ID 0004]
    
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


    PRIMARY KEY (`AssetId`, `MeasurementDateTime`, `GateNum`)
);


CREATE TABLE `TemperatureProfilerMeasurements` (
    `AssetId` SMALLINT UNSIGNED, #(integer) (nnnn)

    `MeasurementDateTime` DATETIME, #(string) (dd/mm/yyyy hh:mm:ss)

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

    PRIMARY KEY (`AssetId`, `MeasurementDateTime`, `GateNum`)
);


CREATE TABLE `WindProfilerMeasurements` (
    `AssetId` SMALLINT UNSIGNED, #(integer) (nnnn)

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

    PRIMARY KEY (`AssetId`, `MeasurementDateTime`, `GateNum`)
);

/*
CREATE TABLE ASOSMeasurements (
    AssetId SMALLINT UNSIGNED,

    MeasurementDateTime DATETIME,

    asos_sky_condition_report
    asos_visibility
    asos_tower_visibility
    asos_present_weather
    asos_urgent_weather
    asos_sea_level_pressure
    asos_dew_point
    asos_relative_humidity
    asos_wind_direction
    asos_wind_speed
    asos_magnetic_wind_direction
    asos_magnetic_wind_speed
    asos_altimeter_pressure_setting
    asos_density_altitude
    asos_pressure_altitude
    asos_remark
    asos_rain_rate
    asos_temperature

);
*/