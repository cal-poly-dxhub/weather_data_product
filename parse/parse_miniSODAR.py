import csv

csv_file_path = "./sample_data/Mini-SODAR.0518.20191231000015.csv"
raw_file_path = "./sample_data/Mini-SODAR.DASS_DIOSA.20200801000021.raw"

miniSODAR_instrument = {
    "asset_id": None,
    "measurement_date_time": None,
    "mx_height": None,
    "u_noise": None,
    "v_noise": None,
    "w_noise": None
}

miniSODAR_codes = {
    '1': 'mx_height',
    '2': 'u_noise',
    '3': 'v_noise',
    '4': 'w_noise',
    '5': 'n_gates',
    '6': 'gate_record'
}

#------------------------------------ csv --------------------------------------
'''
with open(csv_file_path, "r") as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')

    line_num = 0

    for row in csv_reader:
        line_num += 1
        if line_num == 1:
            miniSODAR_instrument['asset_id'] = row[0]
        elif line_num == 2:
            miniSODAR_instrument['measurement_date_time'] = row[0]
        elif line_num > 2 and line_num <= 7 and len(row) == 2:
            miniSODAR_instrument[miniSODAR_codes[row[0]]] = row[1]
        elif line_num > 7 and int(row[0]) == 6:
            insert_measurement_stmt = """INSERT INTO MiniSODARMeasurement(AssetId, MeasurementDateTime, MxHeight, UNoise, VNoise, WNoise)
                                        VALUES({}, '{}', {}, {}, {}, {})""".format(miniSODAR_instrument['asset_id'], miniSODAR_instrument['measurement_date_time'], miniSODAR_instrument['mx_height'], miniSODAR_instrument['u_noise'], miniSODAR_instrument['v_noise'], miniSODAR_instrument['w_noise'])

            print(insert_measurement_stmt)
            print("\n" + "MeasurementId returned by statement execution (ex. 123)" + "\n")

            insert_stmt = """INSERT INTO MiniSODARGateResponse(MeasurementID, GateNum, HT, HT_QCFLAG, ...)
                            VALUES(123, {});""".format(", ".join(row[1:])) #skip row[0] b/c it's the row identifier
            print(insert_stmt)
            break
        
'''
#------------------------------------ raw --------------------------------------

with open(raw_file_path, "r") as raw_file:

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