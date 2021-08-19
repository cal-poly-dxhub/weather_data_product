import React, { useState, useContext } from 'react';

import { useMediaQuery } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import theme from '../../theme'

export default function MoreMenu(props) {
  const matchesMd = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Menu
      id="simple-menu"
      anchorEl={props.anchorEl}
      keepMounted
      open={Boolean(props.anchorEl)}
      onClose={props.handleClose}
      style={{backgroundColor: 'rgba(0,0,0,0.4)'}}
    >
      {matchesMd ? (
        <div>
        <MenuItem onClick={props.handleClose}>
          <a style={{textDecoration: 'none', color: 'white'}} href={props.api_docs_url}>
            API Docs
          </a>
          </MenuItem>
        <MenuItem onClick={props.handleClose}>
          <a style={{textDecoration: 'none', color: 'white'}} href={props.eedback_form_url}>
            Give Feedback
          </a>
        </MenuItem>
        <Divider style={{backgroundColor: "#3c3540", marginTop: "5px"}}/>
        </div>
      ) : undefined}
      <div style={{padding: "1rem"}}>
        <Typography variant="subtitle2" style={{color: "#635b69"}}>VAFB XUI Demo</Typography>
        <Typography variant="body2" style={{color: "#635b69"}}>Version 4.0.0</Typography>
      </div>
    </Menu>
  );
}