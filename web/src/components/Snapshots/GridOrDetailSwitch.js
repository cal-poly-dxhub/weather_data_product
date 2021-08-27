import React, { useEffect, useContext, useState } from 'react';

import { Route, Switch, Redirect, useRouteMatch } from 'react-router-dom';

import { Box } from '@material-ui/core';

import { UserContext } from '../../contexts/UserProvider';

import SnapshotGrid from './SnapshotGrid';
import DetailView from '../DetailView/DetailView';
import TowerMap from './TowerMap'

const ROOT_PLACEHOLDER = {asset_name: "Root"}

export default function 
GridOrDetailSwitch(props) {
  const [state, dispatch] = useContext(UserContext);
  const [metadata, setMetadata] = useState([ROOT_PLACEHOLDER]);
  const [selectedMetadata, selectMetadata] = useState({});
  const Spacer = require('react-spacer');
  const match = useRouteMatch();

  useEffect(() => {
    props.setInstrument(props.instrumentName);
    props.setCategory(props.categoryName);

    setMetadata([ROOT_PLACEHOLDER]);
  }, [props.instrumentName, props.categoryName]);

  useEffect(() => {
    if (metadata.length <= 1) {
      switch (props.instrumentName) {
        case "profiler":
          props.apiManager.sendMetadataRequest(state.instruments["profiler"].path, state.instruments["profiler"][props.categoryName].path)
          .then((metadata) => {
            setMetadata(metadata);
          });

          break;
        default:
          props.apiManager.sendMetadataRequest(state.instruments[props.instrumentName].path, "")
          .then((metadata) => {
            setMetadata(metadata);
          });

          break;
      }
    }
  }, [metadata]);

  useEffect(() => {
    if (metadata.length > 0 && props.focusedSnapshot.instrument) {
      switch (props.instrumentName) {
        case "amps":
          let foundAmps = metadata.find(meta => meta.BalloonName == props.focusedSnapshot.instrument.BalloonName);

          if (foundAmps != undefined) {
            selectMetadata(foundAmps);
          }

          break;
        case "tower":
          let foundTower = metadata.find(meta => meta.archive_number == props.focusedSnapshot.instrument.asset_id);

          if (foundTower != undefined) {
            selectMetadata(foundTower);
          }

          break;  
        default:
          let found = metadata.find(meta => meta.asset_id == props.focusedSnapshot.instrument.asset_id);

          if (found != undefined) {
            selectMetadata(found);
          }
      }  
    }
  }, [props.focusedSnapshot]);

  const detailView = (instrumentName, categoryName="") => (
    <DetailView
      {...props}
      snapshot={!state.settings.imperial ? props.focusedSnapshotMetric : props.focusedSnapshot} 
      selectedMetadata={selectedMetadata}
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
        instrumentName={instrumentName} 
        categoryName={categoryName} 
        metadata={metadata}
      />

      <Spacer grow={1}/>
    </Box>
  );

  return (
      <Switch>
        <Route path={`${match.path}/detail/:asset_id`}>
          {detailView(props.instrumentName, props.categoryName)}
        </Route>

        <Route path={`${match.path}/list/detail/:asset_id`}>
          {detailView(props.instrumentName, props.categoryName)}
        </Route>

        <Route exact path={`/home/tower/map`}>
          <TowerMap 
            {...props}
            metadata={metadata}
            selectMetadata={selectMetadata}
            selectedMetadata={selectedMetadata}
          />
        </Route>

        <Route path={`/home/tower/list`}>
          {snapshotGrid("tower", "list")}
        </Route>

        <Route path={`/home/tower`}>
          <Redirect to={"/home/tower/map"}/>
        </Route>

        <Route path={`${match.path}`}>
          {snapshotGrid(props.instrumentName, props.categoryName)}
        </Route>
      </Switch>
  );
}
