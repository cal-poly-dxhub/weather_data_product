import axios from 'axios';

export default class APIManager {
  isMissing(num) {
    const regex = "[9.]+$";
  
    if (num == null || num.toString().match(regex)) {
      return true;
    }
  
    return false;
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