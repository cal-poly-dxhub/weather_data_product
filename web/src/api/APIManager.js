import axios from 'axios';

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

  async sendMetadataRequest(instrumentPath, categoryPath, key) {
    try {
      let baseUrl = 'https://qqviypx48b.execute-api.us-gov-west-1.amazonaws.com/dev/' 
      + instrumentPath 
      + (categoryPath == null ? "" : categoryPath);

      baseUrl = baseUrl.slice(0, -1);

      return await axios
      .get(baseUrl, {
        params: {},
        headers: {
          'Accept': '*/*',
          'x-api-key': 'sbnnxUa0Y94y0rn9YKSah8MyOmRVbmZYtUq9ZbK0',
        }
      })
      .then((resp) => {
        return resp.data;
      });
    } catch (err) {
        console.error("metadata error: ", err);
    }
  }

  async handleTowerProductCodes(tower_data) {
    try {
      return await axios
      .get('https://qqviypx48b.execute-api.us-gov-west-1.amazonaws.com/dev/tower/codes' , {
        params: {},
        headers: {
          'Accept': '*/*',
          'x-api-key': 'sbnnxUa0Y94y0rn9YKSah8MyOmRVbmZYtUq9ZbK0',
        }
      })
      .then((resp) => {
        console.log("codes: ", resp.data);

        const headers = [];

        resp.data.forEach(tower_code => {
          let header = {
            field: tower_code.code,
            headerName: tower_code.description
          }

          headers.push(header);
        });

        return headers;
      });
    } catch (err) {
        console.error("get error: ", err);
    }
  }

  convertToMetric(data) {
    const clone = JSON.parse(JSON.stringify(data))

    clone.forEach((snapshot) => {
      if ("asset_height" in snapshot.instrument) {
        snapshot.instrument.asset_height = (snapshot.instrument.asset_height * IMP_TO_MET_DIST).toFixed(4);
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
      const baseUrl = 'https://qqviypx48b.execute-api.us-gov-west-1.amazonaws.com/dev/' 
      + instrumentPath 
      + (categoryPath == null ? "" : categoryPath)  
      + `snapshot?units=${includeUnits}`;

      return await axios
      .get(baseUrl, {
        params: {},
        headers: {
          'Accept': '*/*',
          'x-api-key': 'sbnnxUa0Y94y0rn9YKSah8MyOmRVbmZYtUq9ZbK0',
        }
      })
      .then((resp) => {
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
        });

        return resp.data;
      });
    } catch (err) {
        console.error("get error: ", err);
    }
  }
}