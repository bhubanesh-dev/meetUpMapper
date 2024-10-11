import { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { findRoute } from "../api/allApiCall";

const MapBox = ({start ,end}) => {
  const mapContainerRef = useRef(null); // Ref for the map container
  const mapRef = useRef(null); // Ref to hold the map instance
  const [UserCurrentLocation, setUserCurrentLocation] = useState(null); // State to hold user location

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentLocation = [longitude, latitude]; // Correcting order to [lng, lat]
          setUserCurrentLocation(currentLocation); // Set user location
          // socket.emit("send-location", currentLocation); // Uncomment if using Socket.IO
        },
        (error) => {
          console.error("Error retrieving location", error);
          alert("Could not retrieve your location.");
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      alert("Geolocation not supported by your browser.");
    }
  }, []);

  useEffect(() => {
    // Set the access token for Mapbox
    mapboxgl.accessToken =
      "pk.eyJ1IjoiYmh1YmFuZXNoIiwiYSI6ImNtMjRmdjZ0cjBld20ya3M2YmJpZXU5N2IifQ.wh5hD6W4E0PHIn1xmqdPlQ";

    if (UserCurrentLocation && !mapRef.current) {
      // Initialize the map once the user's location is available
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11", // Map style
        center: UserCurrentLocation, // Use the user's current location [lng, lat]
        zoom: 12, // Starting zoom level
      });

      // Optional: Add marker for user's location
      new mapboxgl.Marker()
        .setLngLat(UserCurrentLocation) // Set the marker at user's location
        .setPopup(
          new mapboxgl.Popup({ offset: 30 }) // Create a popup
            .setHTML(`<h3>you</h3>`) // Set the popup content
        )
        .addTo(mapRef.current);
      // const end = [72.897321, 19.105612]; // The destination coordinates
      new mapboxgl.Marker()
        .setLngLat(end)
        .setPopup(
          new mapboxgl.Popup({ offset: 30 }) // Create a popup
            .setHTML(`<h3>you friend</h3>`) // Set the popup content
        )
        .addTo(mapRef.current);
      // Async function to fetch the directions
      const direction = async () => {
        try {
          await findRoute(
            mapRef.current,
            UserCurrentLocation,
            end,
            mapboxgl.accessToken
          ); // Call the findRoute function
        } catch (error) {
          console.error("Error fetching directions:", error);
        }
      };

      // Call the direction function after definition
      direction();
    }
  }, [UserCurrentLocation]); // Dependency array ensures this runs when UserCurrentLocation changes

  return (
    <div
      // Full viewport height and width
      ref={mapContainerRef} // Ref for the map container div
      className="map-container h-[70dvh]"
    />
  );
};

export default MapBox;
