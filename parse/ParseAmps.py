import pymysql
import sys
import re
from datetime import datetime

def bucket_read(file_name):
    file = open(file_name, "r")

    row_num = 0
    lines = re.sub(" +", " ", file.read()).split("\n")
    lines = [line.strip() for line in lines]
    insert_data_stmt_header = """Insert into Amps2Measurements(FileLocation, MeasurementDatatime,
        GeometHeight, GeopotHeight, RiseRate, Dir, SpeedFPS, SpeedKnots, Temp, Dew, BP, RH, ABH,
        DEN, MIR, OIR, VS, Shear, ShrDir, VP, PW, VX, VY, VelErr, Edit) Values """
    insert_data_stmt_footer = ""

    measurement_id = None
    date_time = None

    for row in lines:
        row_num += 1
        row_arr = row.split()
        if row_num == 1:
            row_arr = row.split("_")
            measurement_id = row_arr[2]
            print("Measurement ID: {}".format(measurement_id))
            date = "/".join(row_arr[4:7])
            time = ":".join(row_arr[7:])
            date_time_str = date + " " + time
            date_time = datetime.strptime(
                date_time_str, "%Y/%m/%d %H:%M:%S").strftime("%Y-%m-%d %H:%M:%S")

        elif re.search("END_OF_RECORD", row): # End of file
            break
        elif row_num >= 5: # Data
            insert_data_stmt_footer = "({}, {}, {})".format(file_name, date_time, ", ".join(row_arr[1:]))
            insert_data_stmt_final = insert_data_stmt_header + insert_data_stmt_footer
            print(insert_data_stmt_final)
        else:
            continue



args = sys.argv[1:]
bucket_read(args[0])
