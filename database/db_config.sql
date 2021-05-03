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

#double check data types
CREATE TABLE MiniSODARMeasurements (
    AssetId INT, #(integer) (nnnn)
    
    MeasurementDateTime DATETIME, #(string) (dd/mm/yyyy hh:mm:ss)
    
    MxHeight INT, #Mixing Height in meters (int) (nnn) [ID 0001]
    
    UNoise INT, #Noise level of the U measurement in millivolts (int) (nnnn) [ID 0002}
    
    VNoise INT, #Noise level of the V measurement in millivolts (int) (nnnn) [ID 0003]
    
    WNoise INT, #Noise level of the W measurement in millivolts (int) (nnnn) [ID 0004]
    
    GateNum INT, #The number of this gate (integer) (nn)
    
    HT INT, #Sample height in meters (integer) (nnn)

    SPD DOUBLE(4, 2), #Speed in meters per second (floating point) (nn.nn)

    DIR INT, #Direction in degrees (integer) (nnn)

    GSPD DOUBLE(4, 2), #Gust speed in meters per second (floating point) (nn.nn)

    GDIR INT, #Gust Direction in degrees (integer) (nnn)

    W DOUBLE(4,2), #Vertical wind component in meters per second (signed floating point) (sn.nn)

    SDW DOUBLE(4,2), #1 minute Standard deviation of W in meters per second (floating point) (nn.nn)

    NW INT, #Number of W observations in the sample (integer) (nn)

    IW INT, #Signal return intensity in milivolts (integer) (nnnn)

    SNRW INT, #Signal to Noise Ratio of the W component no units (integer) (nnnn)

    U DOUBLE(4,2), #East West wind component in meters per second (signed floating point) (snn.nn)

    SDU DOUBLE(4,2), #Standard deviation of U in meters per second (floating point) (nn.nn)

    NU INT, #Number of U observations in the sample (integer) (nn)

    IU INT, #Signal return intensity in milivolts (integer) (nnnn)

    SNRU INT, #Signal to Noise Ratio of the U component no units (integer) (nnnn)

    V DOUBLE(4,2), #North South wind component in meters per second (signed floating point) (snn.nn)

    SDV DOUBLE(4,2), #Standard deviation of V in meters per second (floating point) (nn.nn)

    NV INT, #Number of V observations in the sample (integer) (nn)

    IV INT, #Signal return intensity in milivolts (integer) (nnnn)

    SNRV INT, #Signal to Noise Ratio of the V component no units (integer) (nnnn)

    SDW5 DOUBLE(4,2), #5 minute Standard deviation of W in meters per second (floating point) (nn.nn)

    SDW10 DOUBLE(4,2), #10 minute Standard deviation of W in meters per second (floating point) (nn.nn)


    PRIMARY KEY (AssetId, MeasurementDateTime, GateNum)
);