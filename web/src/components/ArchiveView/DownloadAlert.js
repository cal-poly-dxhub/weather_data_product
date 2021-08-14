import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function DownloadAlert(props) {
  const handleClose = () => {
    props.setOpen(false);
    props.setDownloadUrl(null);
  };

  return (
    <Dialog
      open={props.isOpen}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{"Are you sure you want to download this file?"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description" style={{color: "gray"}}>
          You will be redirected briefly.
        </DialogContentText>
      </DialogContent>
      <DialogActions style={{padding: 20}}>
        <Button variant="outlined" onClick={handleClose} color="primary">
          Go Back
        </Button>
        <Button onClick={() => {
          handleClose();
          window.open(props.downloadUrl);
        }} color="primary" autoFocus>
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
}
