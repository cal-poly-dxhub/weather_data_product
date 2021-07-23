import React, { useContext, useEffect, useState } from 'react';

import { Box, Grid } from '@material-ui/core';

import InstrumentChips from './InstrumentChips';
import CategoryChips from './CategoryChips';
import SnapshotGrid from './SnapshotGrid';

import { UserContext } from '../contexts/UserProvider';

export default function SnapshotHub() {
  const [state, dispatch] = useContext(UserContext);
  const [instrument, setInstrument] = useState(Object.keys(state.instruments)[0]);
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (state.instruments[instrument].data == undefined) {  // Data is nested inside path, e.g. profiler
      setCategory(Object.keys(state.instruments[instrument])[1])
    } else {
      setCategory("")
    }
  }, [instrument]);

  function renderSwitch() {
    switch(instrument) {
      case "sodar":
        return <SnapshotGrid instrument="sodar" category={category}/>;
      case "profiler":
        return (<div>
          <CategoryChips instrument={state.instruments[instrument]} category={category} setCategory={setCategory}/>
          <SnapshotGrid instrument="profiler" category={category}/>
        </div>);
      case "tower":
        return <SnapshotGrid instrument="tower" category={category}/>;
      case "asos":
        return <SnapshotGrid instrument="asos" category={category}/>;
      case "amps":
        return <SnapshotGrid instrument="amps" category={category}/>;
      default:
        return <SnapshotGrid instrument="sodar" category={category}/>;
    }
  }

  return (
    <Box>
      <section>
        <InstrumentChips setInstrument={setInstrument}/>
      </section>
      <section>
        {renderSwitch()}
      </section>
    </Box>
  );
}