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
    setInstrument(instrumentKeyCache === "" ? Object.keys(state.instruments)[0] : instrumentKeyCache);
  }, [])

  useEffect(() => {
    setFocusedSnapshot({});

    if (state.instruments[instrument].data == null) {  // Data is nested inside path, e.g. profiler
      setCategory(Object.keys(state.instruments[instrument])[1])
    } else {
      setCategory("")
    }
  }, [instrument]);

  function renderSwitch() {
    return (
    <Switch>
      <Route exact path={`${props.match.path}/${instrument}${category == "" ? "" : `/${category}`}`}>
        <div>
          {state.instruments[instrument].data == null 
            ? (
              <CategoryChips instrument={state.instruments[instrument]} category={category} setCategory={setCategory}/>
            ) : undefined}
            
          <SnapshotGrid instrument={instrument} category={category} setFocusedSnapshot={setFocusedSnapshot}/>
        </div>

      </Route>

      <Route exact path={`${props.match.path}/profiler/temp/wind`}>
        <Redirect to={`${props.match.path}/profiler/wind`}/>
      </Route>

      <Route exact path={`${props.match.path}/profiler/temp/wind`}>
        <Redirect to={`${props.match.path}/profiler/wind`}/>
      </Route>

      <Route exact path={`${props.match.path}/profiler/wind/temp`}>
        <Redirect to={`${props.match.path}/profiler/temp`}/>
      </Route>

      <Route exact path={`${props.match.path}/profiler/wind/wind`}>
        <Redirect to={`${props.match.path}/profiler/wind`}/>
      </Route>

      <Route exact path={`${props.match.path}/profiler/temp/temp`}>
        <Redirect to={`${props.match.path}/profiler/wind`}/>
      </Route>


      <Route exact path={`${props.match.path}/profiler`}>
        <Redirect to={`${props.match.path}/profiler/temp`}/>
      </Route>

      <Route exact path={`${props.match.path}/${instrument}${category == "" ? "" : `/${category}`}${focusedSnapshot.instrument == undefined ? "" : `/${focusedSnapshot.instrument.location}`}/detail`}>
        <DetailView
          snapshot={focusedSnapshot} 
          instrument={instrument}
          category={category}
          numRows={5} 
          isMetric={state.settings.imperial} 
        />
      </Route>

      <Route exact path={props.match.path}>
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