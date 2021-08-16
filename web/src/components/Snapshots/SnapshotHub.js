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
  const [instrument, setInstrument] = useState(localStorage.getItem('instrumentKey') == null ? "sodar" : localStorage.getItem('instrumentKey'));
  const [category, setCategory] = useState(localStorage.getItem('instrumentKey') == "profiler" ? "temp" : "");
  const [focusedSnapshot, setFocusedSnapshot] = useState({});
  const [focusedSnapshotMetric, setFocusedSnapshotMetric] = useState({});
  const [focusedColumns, setFocusedColumns] = useState([]);
  const [didGoBack, setGoBack] = React.useState(false);
  const apiManager = new APIManager();
  // const history = useHistory();
  const match = useRouteMatch();

  useEffect(() => {
    localStorage.setItem('instrumentKey', instrument);

    if (state.instruments[instrument] && state.instruments[instrument].data == null) {  // Data is nested inside path, e.g. profiler
      setCategory(Object.keys(state.instruments[instrument])[1])
    } else {
      setCategory("")
    }
  }, [instrument]);

  function renderSwitch() {
    return (
    <Switch>
      <Route path={`${props.match.path}/${instrument}${category == "" ? "" : `/${category}`}${focusedSnapshot.instrument == null ? "" : `/${apiManager.hashCode(focusedSnapshot.instrument.location)}`}/detail`}>
        <DetailView
          snapshot={!state.settings.imperial && Object.keys(focusedSnapshotMetric).length != 0 ? focusedSnapshotMetric : focusedSnapshot} 
          columns={focusedColumns}
          instrument={instrument}
          category={category}
          numRows={5} 
          units={focusedSnapshot.units}
          isMetric={!state.settings.imperial} 
          apiManager={apiManager}
          setGoBack={setGoBack}
        />
      </Route>

      <Route path={`${match.path}/profiler/${category}`}>
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
          setFocusedColumns={setFocusedColumns}
          setInstrument={setInstrument}
          apiManager={apiManager}
          setGoBack={setGoBack}
        />
      </Route>

      <Route path={`${match.path}/profiler`}>
        <Redirect to={`${match.path}/profiler/temp`}/>
      </Route>

      <Route path={`${match.path}/${instrument}`}>
        <SnapshotGrid 
          instrument={instrument} 
          category="" 
          setFocusedSnapshot={setFocusedSnapshot} 
          setFocusedSnapshotMetric={setFocusedSnapshotMetric} 
          setFocusedColumns={setFocusedColumns}
          setInstrument={setInstrument}
          apiManager={apiManager}
          setGoBack={setGoBack}
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