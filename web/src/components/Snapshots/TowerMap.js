import React, { useState, useEffect } from 'react';

import Box from '@material-ui/core/Box';
import { useMediaQuery } from '@material-ui/core';

import theme from '../../theme'

import GoogleMapReact from 'google-map-react';

export default function TowerMap(props) {
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <article 
      style={{
        minWidth: "100%",
        minHeight: "100%",
        // backgroundColor: "green",
        paddingTop: 20,
      }}
    >
      <section 
        style={{
          zIndex: 1, 
          width: "400px", 
          maxWidth: "35%", 
          height: "500px", 
          maxHeight: matchesSm ? "50%" : "50%",
          backgroundColor: "gray",
          borderRadius: "10px",
          position: "absolute",
          marginLeft: "3rem",
          paddingLeft: "1rem",
          marginTop: "1rem"
        }}>
          <h1>Title</h1>
          <h3>Subtitle</h3>
      </section>

      <section 
        style={{
          zIndex: 0, 
          width: "calc(100% - 4rem)",
          maxWidth: "1210px",
          marginLeft: "2rem",
          height: "calc(100% - 13rem)",

          position: "absolute",
          // backgroundColor: "green",
          borderRadius: "15px",
          overflow: "hidden"
        }}
      >
        <GoogleMapReact
          bootstrapURLKeys={{ key: 'AIzaSyCpDdUirt6fRgnMFCuORsAQXOC3hBsBVg0'}}
          defaultCenter={{lat: 34.732686, lng: -120.533849}}
          defaultZoom={15}
          yesIWantToUseGoogleMapApiInternals
          options={map => ({
            fullscreenControl: false,
            mapTypeId: map.MapTypeId.SATELLITE,
            // clickableIcons: false,
            // zoomControl: false,
            // disableDoubleClickZoom: true,
            // streetViewControl: false,
            // gestureHandling: "cooperative",
          })}
        >
          {/* <LocationOnIcon lat={center.lat} lng={center.lng} style={{color: "white", filter: "drop-shadow(0px 0px 6px yellow)"}}/> */}
        </GoogleMapReact> 
      </section> 
    </article>
  );
}