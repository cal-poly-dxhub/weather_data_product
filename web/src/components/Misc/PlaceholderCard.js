import Box from '@material-ui/core/Box';

import './shimmer.css'

export default function PlaceholderCard() {
  const Spacer = require('react-spacer');

  return (
    <Box 
      style={{
        backgroundColor: "#242026", 
        '&:hover': {
          borderColor: '#ffffff',
        },
        width: "100%", 
        height: "100%",
        overflow: "hidden", 
        borderRadius: "10px",  
      }}   
      flexDirection='row' 
      display="flex" 
      alignItems="center" 
      alignContent="center"
    >
      <Spacer width={20}/>

      <Box flexBasis="35%" flexDirection='column' display="flex" alignItems="center" alignContent="center">
        <Spacer grow={1}/>

        <Box className="darkui1-shimmer" style={{width: "60px", height: "30px", borderRadius: "15px"}} display="flex" alignItems="center" justifyContent="center"></Box>

        <Spacer height={10}/>

        <Box className="darkui1-shimmer" style={{width: "100px", height: "10px", borderRadius: "5px"}}></Box>

        <Spacer height={10}/>

        <Box className="darkui1-shimmer" style={{width: "100px", height: "10px", borderRadius: "6px"}}></Box>

        <Spacer grow={1}/>
      </Box>

      <Spacer width={20}/>

      <Box flexBasis="65%"  flexDirection='column' display="flex" alignItems="center">
        <Box className="darkui1-shimmer" style={{width: "100%", height: "30px", borderRadius: "10px"}} display="flex" alignItems="center" justifyContent="center"></Box>

        <Spacer height={30} grow={1}/>

        <Box className="darkui1-shimmer" style={{width: "100%", height: "15px", borderRadius: "7px"}}></Box>

        <Spacer height={20}/>

        <Box className="darkui1-shimmer" style={{width: "100%", height: "15px", borderRadius: "7px"}}></Box>

        <Spacer height={20}/>

        <Box className="darkui1-shimmer" style={{width: "100%", height: "15px", borderRadius: "7px"}}></Box>

        <Spacer height={20}/>

        <Box className="darkui1-shimmer" style={{width: "100%", height: "15px", borderRadius: "7px"}}></Box>

        <Spacer height={20}/>

        <Box className="darkui1-shimmer" style={{width: "100%", height: "15px", borderRadius: "7px"}}></Box>

        <Spacer grow={1}/>
      </Box>

      <Spacer width={20}/>
    </Box>
  );
}