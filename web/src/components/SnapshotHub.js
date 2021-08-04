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
    // const lastItem = window.location.href.substring(window.location.href.lastIndexOf('/') + 1)

    // if (lastItem == "temp" || lastItem == "wind") {
    //   setInstrument("profiler");
    //   setCategory(lastItem);
    // } else {
    //   setInstrument(lastItem);
    // }
  }, [])

  useEffect(() => {
    setFocusedSnapshot({});

    // if (state.instruments[instrument].data == undefined) {  // Data is nested inside path, e.g. profiler
    //   setCategory(Object.keys(state.instruments[instrument])[1])
    // } else {
    //   setCategory("")
    // }
  }, [instrument]);

  function renderSwitch() {
    return (
    <Switch>
      <Route path={`${props.match.path}/profiler`}>
        <div>
          <CategoryChips instrument={state.instruments[instrument]} category={category} setCategory={setCategory}/>
          <Switch>
            <Route exact path={`${props.match.path}/profiler/temp`}>
              <SnapshotGrid instrument="profiler" category="temp" setFocusedSnapshot={setFocusedSnapshot}/>
            </Route>

            <Route exact path={`${props.match.path}/profiler/wind`}>
              <SnapshotGrid instrument="profiler" category="wind" setFocusedSnapshot={setFocusedSnapshot}/>
            </Route>

            <Route exact path={`${props.match.path}/profiler`}>
              <Redirect to={`${props.match.path}/profiler/temp`}/>
            </Route>
          </Switch>
        </div>
      </Route>

      <Route exact path={`${props.match.path}/${instrument}/${category}`}>
        <SnapshotGrid instrument={instrument} category={category} setFocusedSnapshot={setFocusedSnapshot}/>
      </Route>

      <Route exact path={`${props.match.path}/${instrument}${Object.keys(focusedSnapshot).length == 0 ? "" : `/${focusedSnapshot.instrument.location}`}/detail`}>
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