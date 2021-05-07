import csv

csv_file_path = "./sample_data/915ProfilerWindCNS.0505.20200201000101.csv"
raw_file_path = "./sample_data/915ProfilerWindCNS.915_DIOSA.20200201000017.raw"

wind_profiler_instrument = {
    "asset_id": None,
    "measurement_date_time": None,
    "radial_azimuth": [],
    "radial_elevation": []
}

wind_radial_count = 0

wind_profiler_codes = {
    '2003': 'wind_gates',
    '2004': 'wind_radials',
    '2005': 'wind_gate_record'
}

#------------------------------------ csv --------------------------------------

with open(csv_file_path, "r") as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')

    print("CSV!")

    line_num = 0

    for row in csv_reader:
        line_num += 1
        if line_num == 1:
            wind_profiler_instrument['asset_id'] = row[0]
        elif line_num == 2:
            wind_profiler_instrument['measurement_date_time'] = row[0]
        elif line_num == 4:
            wind_radial_count = int(row[1])
        elif line_num == 5:
            insert_stmt_attr = ""
            for i in range(wind_radial_count):
                wind_profiler_instrument['radial_azimuth'] = row[1 + 2 * i]
                insert_stmt_attr += "AZ-{}, ".format(i + 1)

                wind_profiler_instrument['radial_elevation'] = row[2 + 2 * i]
                insert_stmt_attr += "EL-{}, ".format(i + 1) if i + 1 != wind_radial_count else "EL-{}".format(i + 1)
            insert_measurement_stmt = """INSERT INTO WindProfilerMeasurement(AssetId, MeasurementDateTime, {})
                                        VALUES({}, '{}', {})""".format(insert_stmt_attr, wind_profiler_instrument['asset_id'], wind_profiler_instrument['measurement_date_time'], ", ".join(row[1:]))

            print(insert_measurement_stmt)
            print("\n" + "MeasurementId returned by statement execution (ex. 123)" + "\n")
        elif line_num > 5 and int(row[0]) == 2005:
            insert_stmt_attr = ""
            for i in range(wind_radial_count):
                insert_stmt_attr += "VEL-{0}, VEL-{0}_QCFLAG, OBS-{0}, OBS-{0}_QCFLAG, SNR-{0}, SNR-{0}_QCFLAG".format(i + 1)
                if i + 1 != wind_radial_count:
                    insert_stmt_attr += ", "
            insert_stmt = """INSERT INTO WindProfilerMeasurement(MeasurementID, GateNum, HT, HT_QCFLAG, SPD, SPD_QCFLAG, DIR, DIR_QCFLAG, {})
                            VALUES(123, {});""".format(insert_stmt_attr, ", ".join(row[1:])) #skip row[0] b/c it's the row identifier
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