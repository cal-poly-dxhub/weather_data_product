import React from 'react';

import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles({
  paper: {
    width: 400,
    backgroundColor: '#1C1A1E'
  }
});

export default function ReportBuilder(props) {
  const classes = useStyles();

  return (
    <div>
      <Drawer anchor='right' width='400' openSecondary={true} open={props.open} classes={{paper: classes.paper}}>
        <AppBar title="Build A Report"/>
        <Grid container direction="column" justify="space-between" xs>
          <MenuItem onClick={() => props.setDrawerOpen(false)}>
            <Grid container alignItems='center'>
              <Grid container direction="column" xs>
                <Grid item>
                  <h3>Tower (Temp)</h3>
                  <h5 style={{color: 'gray'}}>1/12/2020 - 2/14/2020 | 3.4 MB</h5>
                </Grid>
              </Grid>
              {/* <Grid item xs>
                <Button variant="text">
                  Remove
                </Button>
              </Grid> */}
            </Grid>
          </MenuItem>
          <Button size="large" color="primary" style={{margin: "1rem"}}>
            <Typography variant="body1" style={{ margin: "0.5rem", marginLeft: '3rem', marginRight: '3rem', fontWeight: "bold" }}>
              Download Report
            </Typography>
          </Button>
        </Grid>
      </Drawer>
    </div>
  );
}
