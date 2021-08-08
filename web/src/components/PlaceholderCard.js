import Box from '@material-ui/core/Box';
import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';

import './shimmer.css'

export default function PlaceholderCard() {
  const Spacer = require('react-spacer');

  return (
    <Card style={{backgroundColor: "#242026", width: "100%", height: "100%"}} variant="outlined">
      <CardContent>
        <Box flexDirection='row' display="flex" alignItems="center" alignContent="center">
          <Box flexDirection='column' display="flex" alignItems="center" alignContent="center" style={{minWidth: "35%"}}>
            <Spacer grow={1}/>

            <Box className="darkui1-shimmer" style={{width: "60px", height: "30px"}} display="flex" alignItems="center" justifyContent="center"></Box>

            <Spacer height={10}/>

            <Box className="darkui1-shimmer" style={{width: "100px", height: "10px"}}></Box>

            <Spacer height={10}/>

            <Box className="darkui1-shimmer" style={{width: "100px", height: "10px"}}></Box>

            <Spacer grow={1}/>
          </Box>

          <Spacer width={20}/>

          <Box flexDirection='column' display="flex" alignItems="center" style={{minWidth: "65%"}}>
            <Box className="darkui1-shimmer" style={{width: "100%", height: "20px"}} display="flex" alignItems="center" justifyContent="center"></Box>

            <Spacer height={20} grow={1}/>

            <Box className="darkui1-shimmer" style={{width: "100%", height: "15px"}}></Box>

            <Spacer height={15}/>

            <Box className="darkui1-shimmer" style={{width: "100%", height: "15px"}}></Box>

            <Spacer height={15}/>

            <Box className="darkui1-shimmer" style={{width: "100%", height: "15px"}}></Box>

            <Spacer height={15}/>

            <Box className="darkui1-shimmer" style={{width: "100%", height: "15px"}}></Box>

            <Spacer height={15}/>

            <Box className="darkui1-shimmer" style={{width: "100%", height: "15px"}}></Box>

            <Spacer height={15}/>

            <Box className="darkui1-shimmer" style={{width: "100%", height: "15px"}}></Box>

            <Spacer grow={1}/>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}