import axios from 'axios';

const hostUrl = 'https://qqviypx48b.execute-api.us-gov-west-1.amazonaws.com/dev/' 
const api_key = 'sbnnxUa0Y94y0rn9YKSah8MyOmRVbmZYtUq9ZbK0'

const IMP_TO_MET_DIST = 0.3047851265;   // MARK: Feet to meters
const IMP_TO_MET_RATE = 0.3047851265;   // MARK: Feet/s to meters/s

export default class APIManager {

  isMissing(num) {
    const regex = "[9.]+$";
  
    if (num == null || num.toString().match(regex)) {
      return true;
    }
  
    return false;
  }

  hashCode(str) {
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr   = str.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  async sendDownloadLinkRequest(instrumentPath, categoryPath, assetID) {
    try {
      const baseUrl = hostUrl
      + instrumentPath 
      + (categoryPath == null ? "" : categoryPath) 
      + `snapshot?assetId=${assetID}`
      + `&csv=true`;

      console.log(baseUrl)

      return await axios.get(baseUrl, {
        params: {},
        headers: {
          'Accept': '*/*',
          'x-api-key': api_key
        }
      }).then((resp) => {
        return resp.data;
      });
    } catch (err) {
        console.error("async error: ", err);
    }
  }

  async sendMetadataRequest(instrumentPath, categoryPath, key) {
    try {
      let baseUrl = hostUrl
      + instrumentPath 
      + (categoryPath == null ? "" : categoryPath);

      baseUrl = baseUrl.slice(0, -1);

      return await axios
      .get(baseUrl, {
        params: {},
        headers: {
          'Accept': '*/*',
          'x-api-key': api_key
        }
      })
      .then((resp) => {
        return resp.data;
      });
    } catch (err) {
        console.error("metadata error: ", err);
    }
  }

  async sendTowerCodesRequest() {
    try {
      return await axios
      .get(hostUrl + 'tower/codes', {
        params: {},
        headers: {
          'Accept': '*/*',
          'x-api-key': api_key
        }
      })
      .then((resp) => {
        const columns = [
          { field: 'id', headerName: 'Height', width: 100, cellClassName: 'super-app-theme--cell' }
        ];

        resp.data.forEach(tower_code => {
          let column = {
            field: tower_code.code.toString(),
            headerName: `${tower_code.description}`,
            width: tower_code.description.length * 10 + 10,
            type: 'number',
            cellClassName: 'super-app-theme--cell'
          }

          columns.push(column);
        });

        return columns;
      });
    } catch (err) {
        console.error("get error: ", err);
    }
  }

  mapCodesToSnapshotData(snapshotsData, columns) {
    let mappedSnapshotsData = [];

    snapshotsData.forEach(snapshot => {
      let copiedSnapshot = {
        instrument: snapshot.instrument,
        measurements: [],
        units: snapshot.units
      };

      snapshot.measurements.forEach(measurement => {
        let copiedMeasurement = {
          metadata: measurement.metadata,
          gateResponses: []
        };

        let groupedGateResponsesByHeight = measurement.gateResponses.reduce((r, a) => {
          r[a.height.toString()] = [...r[a.height.toString()] || [], a];
          return r;
        }, {});

        for (const [heightKey, gateResponsesArray] of Object.entries(groupedGateResponsesByHeight)) {
          let gateResponseToAppend = {
            id: parseInt(heightKey),
          };

          gateResponsesArray.forEach(groupedGateResponse => {  
            let gateResponseColumn = columns.find(column => {
              return column.field == groupedGateResponse.product_code;
            });

            if (gateResponseColumn && gateResponseColumn.field) {
              gateResponseToAppend[gateResponseColumn.field] = groupedGateResponse.value;
            }
          });

          columns.forEach((column) => {
            if (Object.keys(gateResponseToAppend).indexOf(column.field) <= -1) {
              gateResponseToAppend[column.field] = "NaN"
            }
          });

          copiedMeasurement.gateResponses.push(gateResponseToAppend);
        }

        copiedSnapshot.measurements.push(copiedMeasurement);
      });

      mappedSnapshotsData.push(copiedSnapshot);
    });

    return mappedSnapshotsData;
  }

  convertToMetric(data) {
    const clone = JSON.parse(JSON.stringify(data))

    clone.forEach((snapshot) => {
      if ("asset_height" in snapshot.instrument) {
        snapshot.instrument.asset_height = (snapshot.instrument.asset_height * IMP_TO_MET_DIST).toFixed(0);
      }
      
      snapshot.measurements.forEach((measurement) => {
        measurement.gateResponses.forEach((gateResponse) => {
          Object.keys(gateResponse).forEach((key, index) => {
            let unitType = snapshot.units[key];

            if (this.isMissing(gateResponse[key])) {
              gateResponse[key] = "NaN";
            } else {
              switch (unitType) {
                case "dist":
                  gateResponse[key] = (IMP_TO_MET_DIST * gateResponse[key]).toFixed(2);
                  break;
                case "rate":
                  gateResponse[key] = (IMP_TO_MET_RATE * gateResponse[key]).toFixed(2);
                  break;
                case "temp":
                  gateResponse[key] = ((gateResponse[key] -32) * 5/9).toFixed(2);
                  break;
                default:
                  break;
              }
            }
          });
        });
      });
    });

    return clone
  }

  async sendSnapshotRequest(instrumentPath, categoryPath=null, assetId=null, includeUnits=true) {
    try {
      const baseUrl = hostUrl
      + instrumentPath 
      + (categoryPath == null ? "" : categoryPath)  
      + `snapshot?units=${includeUnits}`
      + (assetId == null ? "" : `&assetId=${assetId}`);

      return await axios
      .get(baseUrl, {
        params: {},
        headers: {
          'Accept': '*/*',
          'x-api-key': api_key
        }
      })
      .then((resp) => {
        console.log("url: ", baseUrl);
        console.log("data: ", resp.data)

        resp.data.forEach((snapshot) => {
          snapshot.measurements.forEach((measurement) => {
            measurement.gateResponses.forEach((gateResponse) => {
              Object.keys(gateResponse).forEach((key, index) => {
                let unitType = snapshot.units[key];

                if (this.isMissing(gateResponse[key])) {
                  gateResponse[key] = "NaN";
                }
              });
            });
          });  

          snapshot.measurements.sort((first, second) => {
            let firstDate = Date.parse(first.metadata.measurement_date_time);
            let secondDate = Date.parse(second.metadata.measurement_date_time);
            return secondDate - firstDate;
          })
        });

        return resp.data;
      });
    } catch (err) {
        console.error("get error: ", err);
    }
  }
}