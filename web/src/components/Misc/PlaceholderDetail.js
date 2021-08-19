import Box from '@material-ui/core/Box';
import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';

import { useMediaQuery } from '@material-ui/core';

import theme from '../../theme'

import './shimmer.css'

export default function PlaceholderDetail() {
  const matchesXs = useMediaQuery(theme.breakpoints.down('xs'));
  const Spacer = require('react-spacer');

  return (
    <Box
      display="flex"
      flexDirection="column"
    >
      <Box display="flex" alignItems="center" style={{marginTop: matchesXs  ? "95px" : "20px", marginBottom: "20px"}}>
        <Box className="darkui1-shimmer" style={{width: matchesXs ? "100%" : "50%", height: matchesXs ? "95px" : "70px", borderRadius: "10px"}} display="flex" alignItems="center" justifyContent="center"/>
        <Spacer grow={1}/>
        <Box className="darkui1-shimmer" style={{width: matchesXs ? "0%" : "30%", height: "50px", borderRadius: "10px"}} display="flex" alignItems="center" justifyContent="center"/>
      </Box>

      <Card style={{backgroundColor: "#242026", width: "100%", height: "100%"}} variant="outlined">
        <CardContent>
          <Box flexDirection='column' display="flex" alignItems="center" style={{minWidth: "65%"}}>
            <Box className="darkui1-shimmer" style={{width: "100%", height: "40px", borderRadius: "10px"}} display="flex" alignItems="center" justifyContent="center"></Box>

            <Spacer height={20} grow={1}/>

            <Box className="darkui1-shimmer" style={{width: "100%", height: "15px", borderRadius: "7px"}}></Box>

            <Spacer height={15}/>

            <Box className="darkui1-shimmer" style={{width: "100%", height: "15px", borderRadius: "7px"}}></Box>

            <Spacer height={15}/>

            <Box className="darkui1-shimmer" style={{width: "100%", height: "15px", borderRadius: "7px"}}></Box>

            <Spacer height={15}/>

            <Box className="darkui1-shimmer" style={{width: "100%", height: "15px", borderRadius: "7px"}}></Box>

            <Spacer height={15}/>

            <Box className="darkui1-shimmer" style={{width: "100%", height: "15px", borderRadius: "7px"}}></Box>

            <Spacer height={15}/>

            <Box className="darkui1-shimmer" style={{width: "100%", height: "15px", borderRadius: "7px"}}></Box>

            <Spacer grow={1}/>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}