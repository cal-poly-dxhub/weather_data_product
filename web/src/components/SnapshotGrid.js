import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { DataGrid } from '@material-ui/data-grid';

import { BrowserRouter, Route } from "react-router-dom"

import SnapshotCard from './SnapshotCard';
import snapshotsJSON from '../snapshots.json'
import { UserContext } from '../contexts/UserProvider';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

export default function SnapshotGrid(props) {
  const classes = useStyles();
  const [snapshots, setSnapshots] = useState([]);
  const [leftSnapshot, setLeftSnapshot] = useState({});
  const [state, dispatch] = useContext(UserContext);

  useEffect(() => {
    if (state.instruments[props.instrument].data != undefined && state.instruments[props.instrument].data.length > 0) {
      setSnapshots(state.instruments[props.instrument].data)
    } else if (state.instruments[props.instrument][props.category] != undefined && state.instruments[props.instrument][props.category].data.length > 0) { 
      setSnapshots(state.instruments[props.instrument][props.category].data)
    } else {

      console.log("i shouldn't be seeing this: ", state.instruments[props.instrument])

      const baseUrl = 'https://qqviypx48b.execute-api.us-gov-west-1.amazonaws.com/dev/' 
        + state.instruments[props.instrument].path 
        + (state.instruments[props.instrument][props.category] != undefined ? state.instruments[props.instrument][props.category].path : "") 
        + "snapshot/";

        axios.get(baseUrl, {
          params: {},
          headers: {
            'Accept': '*/*',
            'x-api-key': 'sbnnxUa0Y94y0rn9YKSah8MyOmRVbmZYtUq9ZbK0',
          }
        })
        .then(res => {
          console.log(res.data)
          // console.log(props.instrument + "/" + props.category);
          setSnapshots(res.data);
          dispatch({
            type: "instruments/data", 
            payload: {
              key: props.instrument + "/" + props.category,
              data: res.data
          }})
        })
        .catch(err => {
          console.log(err)
        });
    }
  }, [props.instrument, props.category])

  return (    
    <Grid container className={classes.root} justify='space-between'>
      {/* <Grid item xs={leftSnapshot == {} ? 6 : 0}>
          <SnapshotCard snapshot={leftSnapshot} numRows={35}/>
      </Grid> */}

      {/* <Grid container spacing={2} xs={leftSnapshot != {} ? 6 : 12}> */}
        {snapshots
        // .filter((snapshot) => {
        //   let isTwoColumn = leftSnapshot != {}
          
        //   return(
        //     isTwoColumn
        //       ? (snapshot.instrument.location != leftSnapshot.instrument.location)
        //       : true
        //   )
          
        // })
        .map((snapshot) => (
          <Grid item onClick={() => {setLeftSnapshot(snapshot)}}>
            <SnapshotCard snapshot={snapshot} numRows={5}/>
          </Grid>
        ))}
      {/* </Grid> */}
    </Grid>
  );
}









// useEffect(() => {
//   const baseUrl = 'https://qqviypx48b.execute-api.us-gov-west-1.amazonaws.com/dev/' + props.path + 'snapshot/';

//   if (state.instruments.index == 1) {
//     if (state.instruments.options[state.instruments.index].variants[0].data.length === 0 || state.instruments.options[state.instruments.index].variants[1].data.length === 0) {
      // axios.get(baseUrl, {
      //   params: {},
      //   headers: {
      //     'Accept': '*/*',
      //     'x-api-key': 'sbnnxUa0Y94y0rn9YKSah8MyOmRVbmZYtUq9ZbK0',
      //   }
      // })
      // .then(res => {
      //   console.log(res.data);
      //   setSnapshots(res.data);
      // })
      // .catch(err => {
      //   console.log(err)
      // });
//     }
//   } else {
//     if (state.instruments.options[state.instruments.index].variants[0].data.length === 0) {
//       axios.get(baseUrl, {
//         params: {},
//         headers: {
//           'Accept': '*/*',
//           'x-api-key': 'sbnnxUa0Y94y0rn9YKSah8MyOmRVbmZYtUq9ZbK0',
//         }
//       })
//       .then(res => {
//         console.log(res.data);
//         setSnapshots(res.data);
//       })
//       .catch(err => {
//         console.log(err)
//       });
//     } else {
//       setSnapshots(state.instruments.options[state.instruments.index].variants[0].data);
//     }
//   }

//   // setSnapshots(snapshotsJSON)
// }, [props.path, state.instruments.index])

// useEffect(() => {
//   console.log("contains an object", Object.keys(leftSnapshot).length > 0)
//   changeToTwoColumn(Object.keys(leftSnapshot).length > 0);
// }, [leftSnapshot])

// useEffect(() => {
//   changeToTwoColumn(false);
// }, [state.instruments.index])












// return (
//   <Grid container className={classes.root} justify='space-between'>
//     <Grid item xs={isTwoColumn ? 6 : 0}>
//         <SnapshotCard snapshot={leftSnapshot} numRows={35}/>
//     </Grid>

//     <Grid container spacing={2} xs={isTwoColumn ? 6 : 12}>
//       {snapshots.filter((snapshot) => {
//         return(
//           isTwoColumn
//             ? (snapshot.instrument.location != leftSnapshot.instrument.location)
//             : true
//         )
        
//       }).map((snapshot) => (
//         <Grid item xs={isTwoColumn ? 12 : 12} md={isTwoColumn ? 12 : 6} lg={isTwoColumn ? 6 : 4} xl={isTwoColumn ? 6 : 3} onClick={() => {setLeftSnapshot(snapshot)}}>
//           <SnapshotCard snapshot={snapshot} numRows={5}/>
//         </Grid>
//       ))}
//     </Grid>
//   </Grid>
// );