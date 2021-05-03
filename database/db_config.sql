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

CREATE TABLE TowerMeasurements (
    TowerID INT,
    MeasurementDate DATE,
    MeasurementTime TIME,
    ProductCode INT NOT NULL,
    HeightMeasurement INT NOT NULL,
    Value INT,

    PRIMARY KEY (TowerId, MeasurementDate, MeasurementTime)
);

#optimize data types where applicable
#abstract MxHeight->WNoise attributes to separate table to reduce data duplication? foreign key: (AssetId, MeasurementDateTime)

CREATE TABLE MiniSODARMeasurements (
    AssetId INT, #(integer) (nnnn)
    
    MeasurementDateTime DATETIME, #(string) (dd/mm/yyyy hh:mm:ss)
    
    MxHeight INT, #Mixing Height in meters (int) (nnn) [ID 0001]
    
    UNoise INT, #Noise level of the U measurement in millivolts (int) (nnnn) [ID 0002]
    
    VNoise INT, #Noise level of the V measurement in millivolts (int) (nnnn) [ID 0003]
    
    WNoise INT, #Noise level of the W measurement in millivolts (int) (nnnn) [ID 0004]
    
    GateNum INT, #The number of this gate (integer) (nn)
    
    HT INT, #Sample height in meters (integer) (nnn)

    HT_QCFLAG INT,

    SPD DOUBLE(4, 2), #Speed in meters per second (floating point) (nn.nn)

    SPD_QCFLAG INT,

    DIR INT, #Direction in degrees (integer) (nnn)

    DIR_QCFLAG INT,

    GSPD DOUBLE(4, 2), #Gust speed in meters per second (floating point) (nn.nn)

    GSPD_QCLFAG INT,

    GDIR INT, #Gust Direction in degrees (integer) (nnn)

    GDIR_QCFLAG INT,

    W DOUBLE(3,2) SIGNED, #Vertical wind component in meters per second (signed floating point) (sn.nn)

    W_QCFLAG INT,

    SDW DOUBLE(4,2), #1 minute Standard deviation of W in meters per second (floating point) (nn.nn)

    SDW_QCFLAG INT,

    NW INT, #Number of W observations in the sample (integer) (nn)

    NW_QCFLAG INT,

    IW INT, #Signal return intensity in milivolts (integer) (nnnn)

    IW_QCFLAG INT,

    SNRW INT, #Signal to Noise Ratio of the W component no units (integer) (nnnn)

    SNRW_QCFLAG INT,

    U DOUBLE(4,2) SIGNED, #East West wind component in meters per second (signed floating point) (snn.nn)

    U_QCFLAG INT,

    SDU DOUBLE(4,2), #Standard deviation of U in meters per second (floating point) (nn.nn)

    SDU_QCFLAG INT,

    NU INT, #Number of U observations in the sample (integer) (nn)

    NU_QCFLAG INT,

    IU INT, #Signal return intensity in milivolts (integer) (nnnn)

    IU_QCFLAG INT,

    SNRU INT, #Signal to Noise Ratio of the U component no units (integer) (nnnn)

    SNRU_QCFLAG INT,

    V DOUBLE(4,2) SIGNED, #North South wind component in meters per second (signed floating point) (snn.nn)

    V_QCFLAG INT,

    SDV DOUBLE(4,2), #Standard deviation of V in meters per second (floating point) (nn.nn)

    SDV_QCFLAG INT,

    NV INT, #Number of V observations in the sample (integer) (nn)

    NV_QCFLAG INT,

    IV INT, #Signal return intensity in milivolts (integer) (nnnn)

    IV_QCFLAG INT,

    SNRV INT, #Signal to Noise Ratio of the V component no units (integer) (nnnn)

    SNRV_QCFLAG INT,

    SDW5 DOUBLE(4,2), #5 minute Standard deviation of W in meters per second (floating point) (nn.nn)

    SDW5_QCFLAG INT,

    SDW10 DOUBLE(4,2), #10 minute Standard deviation of W in meters per second (floating point) (nn.nn)

    SDW10_QCFLAG INT,


    PRIMARY KEY (AssetId, MeasurementDateTime, GateNum)
);


CREATE TABLE TemperatureProfilerMeasurements (
    AssetId INT, #(integer) (nnnn)

    MeasurementDateTime DATETIME, #(string) (dd/mm/yyyy hh:mm:ss)

    GateNum INT, #The number of this gate (integer) (nn)

    HT DOUBLE(5,3), #Sample height in Kilometers (floating point) (nn.nnn)

    HT_QCFLAG INT,

    T DOUBLE(3,1) SIGNED, #Temperature in degrees Celsius (signed floating point) (snn.n)

    T_QCFLAG INT,

    Tc DOUBLE(3,1) SIGNED, #Corrected Temperature in degrees Celsius (signed floating point) (snn.n)

    Tc_QCFLAG INT,

    W DOUBLE(3,1) SIGNED, #Vertical wind component in meters per second (signed floating point) (snn.n)

    W_QCFLAG INT,

    SNRT INT SIGNED, #Signal to Noise Ratio of T in dB (signed integer) (snn)

    SNRT_QCFLAG INT,

    SNRTc INT SIGNED, #Signal to Noise Ratio of Tc in dB (signed integer) (snn)

    SNRTc_QCFLAG INT,

    SNRW INT SIGNED, #Signal to Noise Ratio of the W component in dB (signed integer) (snn)

    SNRW_QCFLAG INT,

    CNT-T INT, #Number of Temperature observations in this consensus (integer) (nn)

    CNT-T_QCFLAG INT,

    CNT-Tc INT, #Number of Corrected Temperature observations in this consensus (integer) (nn)

    CNT-Tc_QCFLAG INT,

    CNT-W INT, #Number of W observations in this consensus (integer) (nn)

    CNT-W_QCFLAG INT,

    PRIMARY KEY (AssetId, MeasurementDateTime, GateNum)
);


CREATE TABLE WindProfilerMeasurements (
    AssetId INT, #(integer) (nnnn)

    MeasurementDateTime DATETIME, #(string) (dd/mm/yyyy hh:mm:ss)

    AZ-1 DOUBLE(4,1), #Azimuth of radial (beam) 1 – 5 (float) (nnn.n)

    AZ-2 DOUBLE(4,1), #Azimuth of radial (beam) 1 – 5 (float) (nnn.n)

    AZ-3 DOUBLE(4,1), #Azimuth of radial (beam) 1 – 5 (float) (nnn.n)

    AZ-4 DOUBLE(4,1), #Azimuth of radial (beam) 1 – 5 (float) (nnn.n)

    AZ-5 DOUBLE(4,1), #Azimuth of radial (beam) 1 – 5 (float) (nnn.n)

    EL-1 DOUBLE(3,1), #Elevation of radial (beam) 1 – 5 (float) (nn.n)

    EL-2 DOUBLE(3,1), #Elevation of radial (beam) 1 – 5 (float) (nn.n)

    EL-3 DOUBLE(3,1), #Elevation of radial (beam) 1 – 5 (float) (nn.n)

    EL-4 DOUBLE(3,1), #Elevation of radial (beam) 1 – 5 (float) (nn.n)

    EL-5 DOUBLE(3,1), #Elevation of radial (beam) 1 – 5 (float) (nn.n)

    GateNum INT, #The number of this gate (integer) (nnn)

    HT DOUBLE(6,3), #Sample height in Kilometers (floating point) (nnn.nnn)

    HT_QCFLAG INT,

    SPD DOUBLE(3,1), #Sample speed in meters per second (floating point) (nn.n)

    SPD_QCFLAG INT,

    DIR INT, #Sample direction in degrees (integer) (nnn)

    DIR_QCFLAG INT,

    VEL-1 DOUBLE(3,1) SIGNED, #Velocity of radial (beam) 1 in meters per second (signed floating point) (snn.n)

    VEL-1_QCFLAG INT,

    OBS-1 INT, #Number of observations in the radial (beam) 1 consensus (integer) (nn)

    OBS-1_QCFLAG INT,

    SNR-1 INT SIGNED, #Signal to Noise Ratio of radial (beam) 1 in dB (signed integer) (snn)

    SNR-1_QCFLAG INT,

    VEL-2 DOUBLE(3,1) SIGNED, #Velocity of radial (beam) 2 in meters per second (signed floating point) (snn.n)

    VEL-2_QCFLAG INT,

    OBS-2 INT, #Number of observations in the radial (beam) 2 consensus (integer) (nn)

    OBS-2_QCFLAG INT,

    SNR-2 INT SIGNED, #Signal to Noise Ratio of radial (beam) 2 in dB (signed integer) (snn)

    SNR-2_QCFLAG INT,

    VEL-3 DOUBLE(3,1) SIGNED, #Velocity of radial (beam) 3 in meters per second (signed floating point) (snn.n)

    VEL-3_QCFLAG INT,

    OBS-3 INT, #Number of observations in the radial (beam) 3 consensus (integer) (nn)

    OBS-3_QCFLAG INT,

    SNR-3 INT SIGNED, #Signal to Noise Ratio of radial (beam) 3 in dB (integer) (snn)

    SNR-3_QCFLAG INT,

    VEL-4 DOUBLE(3,1) SIGNED, #Velocity of radial (beam) 4 in meters per second (signed floating point) (snn.n)

    VEL-4_QCFLAG INT,

    OBS-4 INT, #Number of observations in the radial (beam) 4 consensus (integer) (nn)

    OBS-4_QCFLAG INT,

    SNR-4 INT SIGNED, #Signal to Noise Ratio of radial (beam) 4 in dB (integer) (snn)

    SNR-4_QCFLAG INT,

    VEL-5 DOUBLE(3,1) SIGNED, #Velocity of radial (beam) 5 in meters per second (signed floating point) (snn.n)

    VEL-5_QCFLAG INT,

    OBS-5 INT, #Number of observations in the radial (beam) 5 consensus (integer) (nn)

    OBS-5_QCFLAG INT,

    SNR-5 INT SIGNED, #Signal to Noise Ratio of radial (beam) 5 in dB (integer) (snn)

    SNR-5_QCFLAG,

    PRIMARY KEY (AssetId, MeasurementDateTime, GateNum)
);