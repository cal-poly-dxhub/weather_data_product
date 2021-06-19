import sys
import re

def parse_line(line, headers):
    data = {}
    values = line.split(' ')
    if (len(values) != len(headers)):
        print('Error: Not all values are accounted for: ', line)
        sys.exit()
    for i in range(len(values)):
        data[headers[i]] = float(values[i])
    return data

def parse_file(file_name):
    file = open(file_name, 'r')
    lines = re.sub(' +', ' ', file.read()).split('\n')
    for i in range(len(lines)):
        lines[i] = lines[i].strip()

#    headers = lines[3].split(' ')
    headers = [
        'sample time',
        'geomet height',
        'geopot height',
        'rise rate',
        'dir',
        'speed fps',
        'speed knots',
        'temp',
        'dew',
        'bp',
        'rh',
        'abh',
        'den',
        'mir',
        'oir',
        'vs',
        'shear',
        'shr Dir',
        'vp',
        'pw',
        'vx',
        'vy',
        'vel err',
        'edit'
    ]

    for line in lines[4:]:
        if re.search('END_OF_RECORD', line):
            break
        data = parse_line(line, headers)
        for header in headers:
            print(header, ':', data[header], ' ', end='')
        print()

args = sys.argv[1:]
parse_file(args[0])
