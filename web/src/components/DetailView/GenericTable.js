import React, { useState, useEffect, useContext } from 'react';

import { TableContainer } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

export default function FullTable(props) {  
  const [headers, setHeaders] = useState([]);

  useEffect(() => {
    const keys = Object.keys(props.response.gateResponses[0]);
    keys.forEach((key, index) => {
      switch (props.units[key]) {
        case "dist":
          keys[index] = key + (props.isMetric ? " (m)" : " (ft)");
          break;
        case "rate":
          keys[index] = key + (props.isMetric ? " (m/s)" : " (ft/s)");
          break;
        case "temp":
          keys[index] = key + (props.isMetric ? " (C)" : " (F)");  
          break
        case "deg":
          keys[index] = key + " (deg)";  
          break
        default:
          break;
      };
    });
    
    setHeaders(keys)
  }, [props.response]);

  return (
    <TableContainer style={{padding: "1rem"}}>
      <Table size="small" variant='outlined' aria-label="a dense table">
        <TableHead>
          <TableRow>
            {headers.slice(1, 20).map((header) => (
              <TableCell align="right" style={{fontWeight: "bold"}} key={header}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {(props.rowsPerPage > 0 ?
            props.response.gateResponses.slice(props.page * props.rowsPerPage, props.page * props.rowsPerPage + props.rowsPerPage) :
            props.response.gateResponses).map((row, index) => (
            <TableRow key={index}>
              {Object.keys(props.response.gateResponses[0]).slice(1, 20).map((header) => (
                <TableCell align="right" key={`${index}_${header}`}>
                  {row[header]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}