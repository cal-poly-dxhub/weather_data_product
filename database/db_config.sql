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

CREATE TABLE MiniSODARMeasurements (
    AssetId INT, #(integer) (nnnn)
    
    MeasurementDateTime DATETIME, #(string) (dd/mm/yyyy hh:mm:ss)
    
    MxHeight INT, #Mixing Height in meters (int) (nnn) [ID 0001]
    
    UNoise INT, #Noise level of the U measurement in millivolts (int) (nnnn) [ID 0002}
    
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

    W DOUBLE(3,2) signed, #Vertical wind component in meters per second (signed floating point) (sn.nn)

    W_QCFLAG INT,

    SDW DOUBLE(4,2), #1 minute Standard deviation of W in meters per second (floating point) (nn.nn)

    SDW_QCFLAG INT,

    NW INT, #Number of W observations in the sample (integer) (nn)

    NW_QCFLAG INT,

    IW INT, #Signal return intensity in milivolts (integer) (nnnn)

    IW_QCFLAG INT,

    SNRW INT, #Signal to Noise Ratio of the W component no units (integer) (nnnn)

    SNRW_QCFLAG INT,

    U DOUBLE(4,2) signed, #East West wind component in meters per second (signed floating point) (snn.nn)

    U_QCFLAG INT,

    SDU DOUBLE(4,2), #Standard deviation of U in meters per second (floating point) (nn.nn)

    SDU_QCFLAG INT,

    NU INT, #Number of U observations in the sample (integer) (nn)

    NU_QCFLAG INT,

    IU INT, #Signal return intensity in milivolts (integer) (nnnn)

    IU_QCFLAG INT,

    SNRU INT, #Signal to Noise Ratio of the U component no units (integer) (nnnn)

    SNRU_QCFLAG INT,

    V DOUBLE(4,2) signed, #North South wind component in meters per second (signed floating point) (snn.nn)

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