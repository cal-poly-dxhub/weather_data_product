import React, { useEffect, useState } from "react";

import { useRouteMatch, useHistory, Link } from 'react-router-dom';

import { Box, IconButton, Typography } from "@material-ui/core";
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Chip from "@material-ui/core/Chip";

export default function TowerCard(props) {
  const match = useRouteMatch();
  const history = useHistory();
  const [cardIsExpanded, expandCard] = useState(false);
  const Spacer = require('react-spacer')

  useEffect(() => {
    console.log("lucky: ", props.metadata);
  }, [props.metadata]);

  if (props.metadata == null || Object.keys(props.metadata).length == 0) {
    return <div>Loading...</div>;
  } else {
    return (
      <Box
        display="flex"
        flexDirection="column"

        style={{
          padding: 20
        }}
      >
        <Box 
          display="flex"
          alignItems="start"

          onClick={() => {
            props.setInstrument("tower");
            props.setCategory("");
            props.setFocusedSnapshot({});
            props.setFocusedSnapshotMetric({});   
          }}

          style={{
            color: 'white',
          }}
        >
          <Link 
            to={`/home/tower/detail/${props.metadata.archive_number}`}
            style={{
              textDecoration: "none",
            }}
          >
            <Box display="flex" alignItems="center">
              <Typography 
                variant={cardIsExpanded ? "h4" : "h5"}
              >
                {props.metadata.location}
              </Typography>

              <IconButton style={{color: "gray"}}>
                <ChevronRightIcon/>
              </IconButton>
            </Box>

          </Link>

          <Spacer grow={1}/>

          <IconButton 
            style={{
              color: "white",
              backgroundColor: "#38313b",
              borderRadius: "5px"
            }}
            onClick={() => {
              expandCard(!cardIsExpanded)
            }}
          >
            {cardIsExpanded ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
          </IconButton>
        </Box>

        {props.metadata.collocated_instruments && cardIsExpanded ? (
          <Box style={{}}>
            {Object.keys(props.metadata.collocated_instruments).map(key => {
              return (
                <Box display="flex" alignItems="center" component="ul" style={{listStyle: 'none', padding: 0}}>
                  <Typography variant="subtitle2">
                    {key.toUpperCase()}
                  </Typography>

                  <Spacer width={20}/>

                  {props.metadata.collocated_instruments[key].map(instrument => {
                    return (
                      <li key={`${key}_${instrument.asset_id}`}>
                        <Link 
                          to={`/home/${key}${key == "profiler" ? "/temp" : ""}/detail/${instrument.asset_id}`} 
                          style={{
                            textDecoration: "none"
                          }}
                        >
                          <Chip
                            label={instrument.asset_name.toUpperCase()}
                            color="primary"
                            onDelete={undefined}
                            variant="outlined"
                            onClick={() => {
                              props.setInstrument(key);
                              props.setCategory("temp");
                              props.setFocusedSnapshot({});
                              props.setFocusedSnapshotMetric({});
                            }}
                          />
                        </Link>
                      </li>
                    );
                  })}
              </Box>
              );
            })};
          </Box>
        ) : undefined}
      </Box>
    );  
  }
}