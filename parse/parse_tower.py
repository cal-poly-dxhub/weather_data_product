import csv

csv_file_path = "./sample_data/MetTower.0097.20210414230100.csv"

tower_instrument = {
    "tower_id": None,
    "measurement_date_time": None
}

tower_codes = {
    '2070': 'Average 1-Minute Wind X Component',
    '2072': 'Average 1-Minute Temperature',
    '2076': 'Average 1-Minute Relative Humidity'
    # ...
}

#------------------------------------ csv --------------------------------------

with open(csv_file_path, "r") as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')

    print("CSV!")

    line_num = 0

    for row in csv_reader:
        line_num += 1
        if line_num == 1:
            tower_instrument['tower_id'] = row[0]
        elif line_num == 2:
            tower_instrument['measurement_date_time'] = row[0]

            insert_measurement_stmt = """INSERT INTO TowerMeasurements(TowerID, MeasurementDateTime)
                                        VALUES({},'{}')""".format(tower_instrument['tower_id'], tower_instrument['measurement_date_time'])
            print(insert_measurement_stmt)
            print("\n" + "MeasurementId returned by statement execution (ex. 123)" + "\n")


        elif line_num > 2 and len(row) >= 3:
            insert_stmt = """INSERT INTO TowerProductCodeResponse(MeasurementID, ProductCode, HeightMeasurement, Value)
                                        VALUES(123, {})""".format(", ".join(row[:3]))

            
            print(insert_stmt)
            break