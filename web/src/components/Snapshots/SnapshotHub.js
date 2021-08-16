import React, { useContext, useEffect, useState } from 'react';

import Box from '@material-ui/core/Box';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

import theme from '../../theme'

import { Route, Switch, useHistory, useRouteMatch, Redirect } from 'react-router-dom';

import InstrumentChips from '../Chips/InstrumentChips';
import CategoryChips from '../Chips/CategoryChips';
import SnapshotGrid from './SnapshotGrid';

import { UserContext } from '../../contexts/UserProvider';
import DetailView from '../DetailView/DetailView';

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

  const snapshotGrid = (instrumentName, categoryName="") => (
    <SnapshotGrid 
      instrument={instrumentName} 
      category={categoryName} 
      setFocusedSnapshot={setFocusedSnapshot} 
      setFocusedSnapshotMetric={setFocusedSnapshotMetric} 
      setFocusedColumns={setFocusedColumns}
      setInstrument={setInstrument}
      setCategory={setCategory}
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

  function renderSwitch() {
    return (
    <Switch>
      <Route path={`${props.match.path}/${instrument}${category == "" ? "" : `/${category}`}${focusedSnapshot.instrument == null ? "" : `/${apiManager.hashCode(focusedSnapshot.instrument.location)}`}/detail`}>
        <DetailView
          snapshot={!state.settings.imperial ? focusedSnapshotMetric : focusedSnapshot} 
          columns={focusedColumns}
          instrument={instrument}
          category={category}
          units={focusedSnapshot.units}
          isMetric={!state.settings.imperial} 
          apiManager={apiManager}
          setGoBack={setGoBack}
        />
      </Route>

      <Route path={`${match.path}/profiler/temp`}>
        {categoryChips("profiler", "temp")}
        {snapshotGrid("profiler", "temp")}
      </Route>

      <Route path={`${match.path}/profiler/wind`}>
        {categoryChips("profiler", "wind")}
        {snapshotGrid("profiler", "wind")}
      </Route>

      <Route path={`${match.path}/profiler`}>
        <Redirect to={`${match.path}/profiler/temp`}/>
      </Route>

      <Route path={`${match.path}/asos`}>
        {snapshotGrid("asos")}
      </Route>

      <Route path={`${match.path}/amps`}>
        {snapshotGrid("amps")}
      </Route>

      <Route path={`${match.path}/tower`}>
        {snapshotGrid("tower")}
      </Route>

      <Route path={`${match.path}/sodar`}>
        {snapshotGrid("sodar")}
      </Route>

      <Route path={props.match.path}>
        <Redirect to={`${props.match.path}/sodar`}/>
      </Route>
    </Switch>
    );
  }

  return (
    <Box>
      <section>
        <InstrumentChips 
          instrument={instrument} 
          setInstrument={setInstrument} 
          setCategory={setCategory}/>
      </section>
      <section>
        <Backdrop style={{zIndex: theme.zIndex.drawer + 1, color: '#fff'}} open={didGoBack}>
          <Box flexDirection="column" display="flex" alignItems="center">
            <CircularProgress color="inherit" />
          </Box>
        </Backdrop>
        {renderSwitch()}
      </section>
    </Box>
  );
}