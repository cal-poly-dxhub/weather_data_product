import React, { useEffect } from "react";

import { useRouteMatch, useHistory } from 'react-router-dom';

import { Box } from "@material-ui/core";

export default function TowerCard(props) {
  const match = useRouteMatch();
  const history = useHistory();

  useEffect(() => {
    console.log("lucky: ", props.metadata);
  }, [props.metadata]);

  if (props.metadata == null) {
    return (<div></div>);
  } else {
    return (
      <Box>
        <Box onClick={() => {
          props.setInstrument("tower");
          props.setCategory("");
          props.setFocusedSnapshot({});
          props.setFocusedSnapshotMetric({});   

          let detailViewUrl = `/home/tower/detail/${props.metadata.archive_number}`;

          history.push(detailViewUrl);
        }}>
          Tower number: {props.metadata.archive_number}
        </Box>

        {props.metadata.collocated_instruments ? (
          <Box>
            {Object.keys(props.metadata.collocated_instruments).map(key => (
              <Box>
                {props.metadata.collocated_instruments[key].map(instrument => (
                  <div onClick={() => {
                    console.log(instrument.asset_name);


                    if (key != null) {
                      props.setInstrument(key);
                      props.setCategory("temp");
                      props.setFocusedSnapshot({});
                      props.setFocusedSnapshotMetric({});

                      let detailViewUrl = `/home/${key}${key == "profiler" ? "/temp" : ""}/detail/${instrument.asset_id}`;
                      
                      history.push(detailViewUrl);
                    }
                  }}>
                    {`${key}:  ${instrument.asset_name}`}
                  </div>
                ))}
              </Box>
            ))}
          </Box>
        ) : undefined}
      </Box>
    );  
  }
}