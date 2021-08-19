import React, { useContext, useEffect, useState } from 'react';

import Box from '@material-ui/core/Box';
import Backdrop from '@material-ui/core/Backdrop';
import { useMediaQuery } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';

import theme from '../../theme'

import { Route, Switch, useHistory, useRouteMatch, Redirect } from 'react-router-dom';
import GridOrDetailSwitch from './GridOrDetailSwitch'

import InstrumentChips from '../Chips/InstrumentChips';
import CategoryChips from '../Chips/CategoryChips';
import TowerViewSwitch from './TowerMap';

import { UserContext } from '../../contexts/UserProvider';

import APIManager from '../../api/APIManager';

export default function SnapshotHub(props) {
  const [state, dispatch] = useContext(UserContext);
  const [instrument, setInstrument] = useState(Object.keys(state.instruments)[0]);
  const [category, setCategory] = useState("");
  const [focusedSnapshot, setFocusedSnapshot] = useState({});
  const [focusedSnapshotMetric, setFocusedSnapshotMetric] = useState({});
  const [focusedColumns, setFocusedColumns] = useState([]);
  const [didGoBack, setGoBack] = React.useState(false);
  const apiManager = new APIManager();
  const history = useHistory();
  const match = useRouteMatch();
  const Spacer = require('react-spacer');
  const matchesXs = useMediaQuery(theme.breakpoints.down('xs'));

  const pageAccessedByReload = (
    (window.performance.navigation && window.performance.navigation.type === 1) ||
      window.performance
        .getEntriesByType('navigation')
        .map((nav) => nav.type)
        .includes('reload')
  );

  useEffect(() => {
    if (pageAccessedByReload) {
      console.log("refreshed!")
    }
  }, []);

  const gridOrDetailSwitch = (instrumentName, categoryName="") => (
    <GridOrDetailSwitch
      focusedSnapshot={focusedSnapshot}
      focusedSnapshotMetric={focusedSnapshotMetric}
      focusedColumns={focusedColumns}
      instrumentName={instrumentName}
      categoryName={categoryName}
      setInstrument={setInstrument}
      setCategory={setCategory} 
      setFocusedSnapshot={setFocusedSnapshot} 
      setFocusedSnapshotMetric={setFocusedSnapshotMetric}  
      setFocusedColumns={setFocusedColumns}   
      apiManager={apiManager}
      setGoBack={setGoBack}
    />
  );

  const categoryChips = (instrumentName, categoryName) => (
    <CategoryChips 
      instrument={state.instruments[instrumentName]} 
      category={categoryName} 
      setCategory={setCategory} 
      baseURL={`${match.path}/${instrumentName}`}/>
  );

  function InstrumentAndCategorySwitch() {
    return (
    <Switch>
      <Route path={`${match.path}/profiler/temp`}>
        {categoryChips("profiler", "temp")}
        {gridOrDetailSwitch("profiler", "temp")}
      </Route>

      <Route path={`${match.path}/profiler/wind`}>
        {categoryChips("profiler", "wind")}
        {gridOrDetailSwitch("profiler", "wind")}
      </Route>

      <Route path={`${match.path}/profiler`}>
        <Redirect to={`${match.path}/profiler/temp`}/>
      </Route>

      <Route path={`${match.path}/asos`}>
        {gridOrDetailSwitch("asos")}
      </Route>

      <Route path={`${match.path}/amps`}>
        {gridOrDetailSwitch("amps")}
      </Route>

      <Route path={`${match.path}/tower`}>
        {gridOrDetailSwitch("tower")}
        {/* {snapshotGrid("tower")} */}
      </Route>

      <Route path={`${match.path}/sodar`}>
        {gridOrDetailSwitch("sodar")}
      </Route>

      <Route path={props.match.path}>
        <Redirect to={`${props.match.path}/sodar`}/>
      </Route>
    </Switch>
    );
  }

  return (
    <Box display="flex" flexDirection="column" flexGrow={1} style={{
      minHeight: "100%",
    }}>
      <Backdrop style={{zIndex: theme.zIndex.drawer + 1, color: '#fff'}} open={didGoBack}>
        <Box flexDirection="column" display="flex" alignItems="center">
          <CircularProgress color="inherit" />
        </Box>
      </Backdrop>

      <Box display="flex" alignItems="center" style={{
        minWidth: "100%", 
        maxWidth: "1500px",
      }}>
        <InstrumentChips 
          instrument={instrument} 
          setInstrument={setInstrument} 
          setCategory={setCategory}/>
      </Box>

      <Box display="flex" flexDirection="column" flexGrow={1}>
        {InstrumentAndCategorySwitch()}
      </Box>
    </Box>
  );
}