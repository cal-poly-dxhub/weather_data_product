import React, { useContext, useEffect, useState } from 'react';

import { Box } from '@material-ui/core';

import InstrumentChips from './components/InstrumentChips';
import CategoryChips from './components/CategoryChips';
import SnapshotGrid from './components/SnapshotGrid';

import { UserContext } from './contexts/UserProvider';

export default function SnapshotHub() {
  const [state, dispatch] = useContext(UserContext);
  const [path, setPath] = useState("");

  useEffect(() => {
  }, []);


  return (
    <Box>
      <section>
        <InstrumentChips setPath={setPath}/>
        <CategoryChips setPath={setPath}/>
      </section>
      <section>
        <SnapshotGrid path={path}/>
      </section>
    </Box>
  );
}