import { useState, useEffect, useRef } from "react";
import { generateLink } from "../api/allApiCall";
import io from "socket.io-client";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { findRoute } from "../api/allApiCall";

// Connect to the backend using Socket.IO
const socket = io("http://localhost:4000");

const MapComponent = () => {
  const [userCurrentLocation, setUserCurrentLocation] = useState(null);
  const [otherUserCurrentLocation, setOtherUserCurrentLocation] =
    useState(null);
  const [link, setLink] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [isRoomFull, setIsRoomFull] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  const mapContainerRef = useRef(null); // Ref for the map container
  const mapRef = useRef(null); // Use a ref to store the map instance

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

  const handleGenerateLink = async () => {
    try {
      const response = await generateLink();
      const roomId = response.link.split("/").pop();
      setLink(response.link);
      setRoomId(roomId);
      socket.emit("create-room", roomId, (response) => {
        if (response.success) {
          console.log(response.message);
        } else {
          console.error(response.message);
        }
      });
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  const handleLinkChange = (event) => {
    setRoomId(event.target.value);
  };

  const handleSubmitLink = () => {
    if (roomId) {
      socket.emit("join-room", roomId, (response) => {
        if (response.joined) {
          console.log(response.message);
          setIsJoined(true);
        } else {
          console.error(response.message);
        }
      });
    }
  };

  useEffect(() => {
    const handleRoomFull = (status) => {
      setIsRoomFull(status);
      console.log("Room is full:", status);

      if (status) {
        const id = setInterval(() => {
          if (userCurrentLocation) {
            socket.emit("send-location", userCurrentLocation);
            console.log("Location sent to server:", userCurrentLocation);
          }
        }, 4000);
        setIntervalId(id);
      }
    };

    socket.on("room-full", handleRoomFull);

    const handleReceiveLocation = (data) => {
      console.log(`Received location from ${data.id}:`, data.location);
      setOtherUserCurrentLocation(data.location);
    };

    socket.on("receive-location", handleReceiveLocation);

    return () => {
      socket.off("room-full", handleRoomFull);
      socket.off("receive-location", handleReceiveLocation);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [userCurrentLocation, intervalId]);

  useEffect(() => {
    // Set the access token for Mapbox
    mapboxgl.accessToken =
      "pk.eyJ1IjoiYmh1YmFuZXNoIiwiYSI6ImNtMjRmdjZ0cjBld20ya3M2YmJpZXU5N2IifQ.wh5hD6W4E0PHIn1xmqdPlQ";

    if (userCurrentLocation && !mapRef.current) {
      // Initialize the map once the user's location is available
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11", // Map style
        center: userCurrentLocation, // Use the user's current location [lng, lat]
        zoom: 12, // Starting zoom level
      });

      // Optional: Add marker for user's location
      new mapboxgl.Marker()
        .setLngLat(userCurrentLocation) // Set the marker at user's location
        .setPopup(
          new mapboxgl.Popup({ offset: 30 }) // Create a popup
            .setHTML(`<h3>you</h3>`) // Set the popup content
        )
        .addTo(mapRef.current);
      const end = [72.897321, 19.105612]; // The destination coordinates
      if (otherUserCurrentLocation !== null) {
        new mapboxgl.Marker()
          .setLngLat(otherUserCurrentLocation)
          .setPopup(
            new mapboxgl.Popup({ offset: 30 }) // Create a popup
              .setHTML(`<h3>you friend</h3>`) // Set the popup content
          )
          .addTo(mapRef.current);
      }

      // Async function to fetch the directions
      const direction = async () => {
        try {
          await findRoute(
            mapRef.current,
            userCurrentLocation,
            end,
            mapboxgl.accessToken
          ); // Call the findRoute function
        } catch (error) {
          console.error("Error fetching directions:", error);
        }
      };

      // Call the direction function after definition
      if (userCurrentLocation !== null && otherUserCurrentLocation !== null)
        direction();
    }
  }, [userCurrentLocation, otherUserCurrentLocation]);

  return (
    <div className="container mx-auto p-4">
      {isRoomFull && (
        <div className="text-red-500 mb-2">
          You are connected with your friend...
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
        <div className="text-2xl font-bold">MeetUpMapper</div>

        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={handleLinkChange}
          className="p-2 border border-gray-300 rounded"
        />

        <div className="flex">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
            onClick={handleGenerateLink}
          >
            Generate Link
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded ml-2"
            onClick={handleSubmitLink}
          >
            Submit Link
          </button>
        </div>
      </div>

      <div className="h-[100dvh] w-full">
        <div
          // Full viewport height and width
          ref={mapContainerRef} // Ref for the map container div
          className="map-container h-[70dvh]"
        />
      </div>
    </div>
  );
};

export default MapComponent;
