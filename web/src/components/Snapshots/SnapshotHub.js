import React, { useContext, useEffect, useState } from 'react';

import { Box, Grid } from '@material-ui/core';

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
  const apiManager = new APIManager();
  // const history = useHistory();
  const match = useRouteMatch();

  useEffect(() => {
    const instrumentKeyCache = localStorage.getItem('instrumentKey');
    // setInstrument(instrumentKeyCache == null ? Object.keys(state.instruments)[0] : instrumentKeyCache);
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
      <Route exact path={`${props.match.path}/${instrument}${category == "" ? "" : `/${category}`}${focusedSnapshot.instrument == null ? "" : `/${focusedSnapshot.instrument.location}`}/detail`}>
        <DetailView
          snapshot={!state.settings.imperial && Object.keys(focusedSnapshotMetric).length != 0 ? focusedSnapshotMetric : focusedSnapshot} 
          instrument={instrument}
          category={category}
          numRows={5} 
          units={focusedSnapshot.units}
          isMetric={!state.settings.imperial} 
          apiManager={apiManager}
        />
      </Route>

      <Route exact path={`${match.path}/profiler/${category}`}>
        <CategoryChips 
          instrument={state.instruments[instrument]} 
          category={category} 
          setCategory={setCategory} 
          baseURL={`${match.path}/profiler`}/>
        <SnapshotGrid 
          instrument="profiler" 
          category={category} 
          setFocusedSnapshot={setFocusedSnapshot} 
          setFocusedSnapshotMetric={setFocusedSnapshotMetric} 
          setInstrument={setInstrument}
          apiManager={apiManager}
        />
      </Route>

      <Route exact path={`${match.path}/profiler`}>
        <Redirect to={`${match.path}/profiler/temp`}/>
      </Route>

      <Route exact path={`${match.path}/${instrument}`}>
        <SnapshotGrid 
          instrument={instrument} 
          category="" 
          setFocusedSnapshot={setFocusedSnapshot} 
          setFocusedSnapshotMetric={setFocusedSnapshotMetric} 
          setInstrument={setInstrument}
          apiManager={apiManager}
        />
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
        {renderSwitch()}
      </section>
    </Box>
  );
}