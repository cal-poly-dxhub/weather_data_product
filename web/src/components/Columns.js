import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import Paper from '@material-ui/core/Paper';

import LeftColumn from './LeftColumn'
import TablePanel from './TablePanel'

import { ThemeProvider } from '@material-ui/styles';
import theme from '../theme'

function Columns(props) {
  return (
    <ThemeProvider theme={theme}>
      <Grid container direction="row" spacing={2} justify='center'>
        <Grid item xs style={{maxWidth: 900}}>
          <LeftColumn tower={props['tower']}/>
        </Grid>
        <Grid item s style={{maxWidth: 900}}>
          <TablePanel measurements={props}/>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default Columns;