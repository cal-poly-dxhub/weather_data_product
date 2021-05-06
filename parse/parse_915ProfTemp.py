import csv

csv_file_path = "./sample_data/915ProfilerTempCNS.0505.20200201000017.csv"
raw_file_path = "./sample_data/915ProfilerTempCNS.915_DIOSA.20200201000117.raw"

temp_profiler_instrument = {
    "asset_id": None,
    "measurement_date_time": None
}

temp_profiler_codes = {
    '2001': 'temperature_gate_count',
    '2002': 'temperature_record'
}

#------------------------------------ csv --------------------------------------

with open(csv_file_path, "r") as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')

    print("CSV!")

    line_num = 0

    for row in csv_reader:
        line_num += 1
        if line_num == 1:
            temp_profiler_instrument['asset_id'] = row[0]
        elif line_num == 2:
            temp_profiler_instrument['measurement_date_time'] = row[0]
        elif line_num > 3:
            insert_measurement_stmt = """INSERT INTO TemperatureProfilerMeasurement(AssetId, MeasurementDateTime)
                                        VALUES({}, '{}')""".format(temp_profiler_instrument['asset_id'], temp_profiler_instrument['measurement_date_time'])

            print(insert_measurement_stmt)
            print("\n" + "MeasurementId returned by statement execution (ex. 123)" + "\n")

            insert_stmt = """INSERT INTO TemperatureProfilerGateResponse(MeasurementID, GateNum, HT, HT_QCFLAG, T, T_QCFLAG, Tc, Tc_QCFLAG, W, W_QCFLAG, SNRT, SNRT_QCFLAG, SNRTc, SNRTc_QCFLAG, SNRW, SNRW_QCFLAG, CNT-T, CNT-T_QCFLAG, CNT-Tc, CNT-Tc_QCFLAG, CNT-W, CNT-W_QCFLAG)
                            VALUES(123, {});""".format(", ".join(row[1:])) #skip row[0] b/c it's the row identifier
            print(insert_stmt)
            break
        

#------------------------------------ raw --------------------------------------
'''
with open(raw_file_path, "r") as raw_file:

    print("RAW!")

    file_rows = [line.split() for line in raw_file]
    
    miniSODAR_instrument = {
        "asset_id": None,
        "measurement_date_time": " ".join(file_rows[0][1:3]),
        "mx_height": file_rows[2][10],
        "u_noise": file_rows[2][12],
        "v_noise": file_rows[2][14],
        "w_noise": file_rows[2][16]
    }

    insert_measurement_stmt = """INSERT INTO MiniSODARMeasurement(AssetId, MeasurementDateTime, MxHeight, UNoise, VNoise, WNoise)
                                VALUES({}, '{}', {}, {}, {}, {})""".format(miniSODAR_instrument['asset_id'], miniSODAR_instrument['measurement_date_time'], miniSODAR_instrument['mx_height'], miniSODAR_instrument['u_noise'], miniSODAR_instrument['v_noise'], miniSODAR_instrument['w_noise'])

    print(insert_measurement_stmt)
    print("\n" + "MeasurementId returned by statement execution (ex. 123)" + "\n")

    data = file_rows[4:]

    insert_stmt = """INSERT INTO MiniSODARGateResponse(MeasurementID, GateNum, HT, ...)
                    VALUES(123, {});""".format(", ".join(data[0])) #skip row[0] b/c it's the row identifier
    print(insert_stmt)


    #data = [line.split() for line in raw_file][4:]
    #print(data)
'''