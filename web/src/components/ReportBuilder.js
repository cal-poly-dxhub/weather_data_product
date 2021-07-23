import React from 'react';

import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Divider, Typography } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles({
  paper: {
    width: 550,
    backgroundColor: '#1C1A1E'
  }
});

export default function ReportBuilder(props) {
  const classes = useStyles();

  return (
    <div>
      <Drawer anchor='right' width='400' openSecondary={true} open={props.open} classes={{paper: classes.paper}}>
        <AppBar title="Build A Report"/>
        <Grid container direction="column" justify="space-between">
          <MenuItem onClick={() => props.setDrawerOpen(false)}>
            <Grid container alignItems='center'>
              <Grid container direction="column">
                <Grid item>
                  <h3>Tower (Temperature)</h3>
                  <h5 style={{color: 'gray'}}>Motor Pool | 3.4 MB</h5>

                  <Grid container>
                    <Grid item xs={6}>
                      <form className={classes.container} noValidate>
                        <TextField
                          id="datetime-local"
                          label="From"
                          type="datetime-local"
                          defaultValue="2017-05-24T10:30"
                          className={classes.textField}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </form>
                    </Grid>

                    <Grid item xs={6}>
                      <form className={classes.container} noValidate>
                        <TextField
                          id="datetime-local"
                          label="To"
                          type="datetime-local"
                          defaultValue="2017-05-24T10:30"
                          className={classes.textField}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </form>
                    </Grid>
                </Grid>

                <Grid container justify="flex-end">
                  <Grid item>
                    <Button size="large" color="secondary" style={{margin: "1rem", height: "30px", width: "230px"}}>
                      <Typography variant="body2" style={{ margin: "0.5rem", marginLeft: '3rem', marginRight: '3rem', fontWeight: "bold" }}>
                        Download
                      </Typography>
                    </Button>
                  </Grid>
                </Grid>
              </Grid>


              <Divider/>


              <Grid item>
                  <h3>Sodar (Wind)</h3>
                  <h5 style={{color: 'gray'}}>Motor Pool | 3.4 MB</h5>

                  <Grid container>
                    <Grid item xs={6}>
                      <form className={classes.container} noValidate>
                        <TextField
                          id="datetime-local"
                          label="From"
                          type="datetime-local"
                          defaultValue="2017-05-24T10:30"
                          className={classes.textField}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </form>
                    </Grid>

                    <Grid item xs={6}>
                      <form className={classes.container} noValidate>
                        <TextField
                          id="datetime-local"
                          label="To"
                          type="datetime-local"
                          defaultValue="2017-05-24T10:30"
                          className={classes.textField}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </form>
                    </Grid>
                </Grid>

                <Grid container justify="flex-end">
                  <Grid item>
                    <Button size="large" color="secondary" style={{margin: "1rem", height: "30px", width: "230px"}}>
                      <Typography variant="body2" style={{ margin: "0.5rem", marginLeft: '3rem', marginRight: '3rem', fontWeight: "bold" }}>
                        Download
                      </Typography>
                    </Button>
                  </Grid>
                </Grid>
              </Grid>

              <Divider/>


              <Grid item>
                  <h3>AMPS (Ballon)</h3>
                  <h5 style={{color: 'gray'}}>Motor Pool | 3.4 MB</h5>

                  <Grid container>
                    <Grid item xs={6}>
                      <form className={classes.container} noValidate>
                        <TextField
                          id="datetime-local"
                          label="From"
                          type="datetime-local"
                          defaultValue="2017-05-24T10:30"
                          className={classes.textField}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </form>
                    </Grid>

                    <Grid item xs={6}>
                      <form className={classes.container} noValidate>
                        <TextField
                          id="datetime-local"
                          label="To"
                          type="datetime-local"
                          defaultValue="2017-05-24T10:30"
                          className={classes.textField}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </form>
                    </Grid>
                </Grid>

                <Grid container justify="flex-end">
                  <Grid item>
                    <Button size="large" color="secondary" style={{margin: "1rem", height: "30px", width: "230px"}}>
                      <Typography variant="body2" style={{ margin: "0.5rem", marginLeft: '3rem', marginRight: '3rem', fontWeight: "bold" }}>
                        Download
                      </Typography>
                    </Button>
                  </Grid>
                </Grid>
              </Grid>




            </Grid>
          </Grid>
          </MenuItem>
          <Button size="large" color="primary" style={{margin: "1rem"}}>
            <Typography variant="body1" style={{ margin: "0.5rem", marginLeft: '3rem', marginRight: '3rem', fontWeight: "bold" }}>
              Download All
            </Typography>
          </Button>
        </Grid>
      </Drawer>
    </div>
  );
}
