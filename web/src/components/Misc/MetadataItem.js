import React from 'react';

import { Box } from '@material-ui/core';

export default function MetadataItem(props) {
  const Spacer = require('react-spacer');

  if (props.direction == "column") {
    return (
      <Box 
        display="flex" 
        flexDirection='column'
        style={{
          paddingLeft: "15px",
          paddingRight: "15px",
        }}
      >
        <Box style={{color: 'gray', fontWeight: 'bold', textAlign: 'center'}}>
          {props.title.toUpperCase()}
        </Box>

        <Spacer height={2}/>

        <Box 
          style={{
            color: 'white', 
            textAlign: 'center'
            }}
          >
          {props.value}
        </Box>
      </Box>
    );
  } else {
    return (
      <Box display="flex" style={{width: "100%"}} justifyContent="center">
        <Spacer grow={1}/>
  
        <Box justifyContent="flex-end" style={{color: 'gray', fontWeight: 'bold', verticalAlign: "right", textAlign: "right", width: "50%"}}>
          {props.title.toUpperCase()}
        </Box>
  
        <Spacer width={5}/>
  
        <Box style={{color: 'white', textAlign: 'left', width: "50%"}}>
          {props.value}
        </Box>
  
        <Spacer grow={1}/>
      </Box>
    );  
  }
}