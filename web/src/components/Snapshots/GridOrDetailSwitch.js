import React, { useEffect, useContext } from 'react';

import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';

import { Box } from '@material-ui/core';

import { UserContext } from '../../contexts/UserProvider';

import SnapshotGrid from './SnapshotGrid';
import DetailView from '../DetailView/DetailView';

export default function GridOrDetailSwitch(props) {
  const [state, dispatch] = useContext(UserContext);
  const Spacer = require('react-spacer');
  const match = useRouteMatch();

  const detailView = (instrumentName, categoryName="") => (
    <DetailView
      {...props}
      snapshot={!state.settings.imperial ? props.focusedSnapshotMetric : props.focusedSnapshot} 
      instrument={instrumentName}
      category={categoryName}
      isMetric={!state.settings.imperial} 
      units={props.focusedSnapshot ? props.focusedSnapshot.units : {}}
    />
  );

  const snapshotGrid = (instrumentName, categoryName="") => (
    <Box display="flex" flexDirection="column">
      <SnapshotGrid 
        {...props}
        instrument={instrumentName} 
        category={categoryName} 
      />

      <Spacer grow={1}/>
    </Box>
  );

  return (
      <Switch>
        <Route path={`${match.path}/detail/:asset_id`}>
          {detailView(props.instrumentName, props.categoryName)}
        </Route>

        <Route path={`${match.path}/`}>
          {snapshotGrid(props.instrumentName, props.categoryName)}
        </Route>
      </Switch>
  );
}
