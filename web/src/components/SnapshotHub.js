import React, { useContext, useEffect, useState } from 'react';

import { Box, Grid } from '@material-ui/core';

import { Route, Switch, useHistory, useRouteMatch, Redirect } from 'react-router-dom';

import InstrumentChips from './InstrumentChips';
import CategoryChips from './CategoryChips';
import SnapshotGrid from './SnapshotGrid';

import { UserContext } from '../contexts/UserProvider';
import DetailView from './DetailView';
import { Category } from '@material-ui/icons';

export default function SnapshotHub(props) {
  const [state, dispatch] = useContext(UserContext);
  const [instrument, setInstrument] = useState(Object.keys(state.instruments)[0]);
  const [category, setCategory] = useState("");
  const [focusedSnapshot, setFocusedSnapshot] = useState({});
  const history = useHistory();
  const match = useRouteMatch();

  useEffect(() => {
    const instrumentKeyCache = localStorage.getItem('instrumentKey');
    setInstrument(instrumentKeyCache == null ? Object.keys(state.instruments)[0] : instrumentKeyCache);
  }, [])

  useEffect(() => {
    setFocusedSnapshot({});

    if (state.instruments[instrument] && state.instruments[instrument].data == null) {  // Data is nested inside path, e.g. profiler
      setCategory(Object.keys(state.instruments[instrument])[1])
    } else {
      setCategory("")
    }
  }, [instrument]);

  function renderSwitch() {
    return (
    <Switch>
      <Route path={`${props.match.path}/${instrument}${category == "" ? "" : `/${category}`}${focusedSnapshot.instrument == null ? "" : `/${focusedSnapshot.instrument.location}`}/detail`}>
        <DetailView
          snapshot={focusedSnapshot} 
          instrument={instrument}
          category={category}
          numRows={5} 
          isMetric={state.settings.imperial} 
        />
      </Route>

      <Route path={`${match.path}/sodar`}>
        <SnapshotGrid instrument="sodar" category="" setFocusedSnapshot={setFocusedSnapshot}/>
      </Route>

      <Route path={`${match.path}/tower`}>
        <SnapshotGrid instrument="tower" category="" setFocusedSnapshot={setFocusedSnapshot}/>
      </Route>

      <Route path={`${match.path}/asos`}>
        <SnapshotGrid instrument="asos" category="" setFocusedSnapshot={setFocusedSnapshot}/>
      </Route>

      <Route path={`${match.path}/amps`}>
        <SnapshotGrid instrument="amps" category="" setFocusedSnapshot={setFocusedSnapshot}/>
      </Route>

      <Route path={`${match.path}/profiler/temp`}>
        <CategoryChips instrument={state.instruments[instrument]} category={category} setCategory={setCategory}/>
        <SnapshotGrid instrument="profiler" category="temp" setFocusedSnapshot={setFocusedSnapshot}/>
      </Route>

      <Route path={`${match.path}/profiler/wind`}>
        <CategoryChips instrument={state.instruments[instrument]} category={category} setCategory={setCategory}/>
        <SnapshotGrid instrument="profiler" category="wind" setFocusedSnapshot={setFocusedSnapshot}/>
      </Route>

      <Route path={`${match.path}/profiler`}>
        <Redirect to={`${match.path}/profiler/temp`}/>
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
        <InstrumentChips instrument={instrument} setInstrument={setInstrument}/>
      </section>
      <section>
        {renderSwitch()}
      </section>
    </Box>
  );
}