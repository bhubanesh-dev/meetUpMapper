// src/axios/allApiCall.js

import apiClient from "./axiosConfig";

// Function to generate a link using POST request
export const generateLink = async () => {
  try {
    const response = await apiClient.post("/api/app/generate-link");
    return response.data;
  } catch (error) {
    console.error("Error generating link:", error); // Log error properly
    alert("Error generating link. Please try again later.");
    throw error;
  }
}; // create a function to make a directions request
export const findRoute = async (map, start, end, accessToken) => {
  console.log(start,end);
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]}%2C${start[1]}%3B${end[0]}%2C${end[1]}?steps=true&geometries=geojson&access_token=${accessToken}`,
    { method: "GET" }
  );
  console.log(query);
  const json = await query.json();
  const data = json.routes[0];
  const route = data.geometry.coordinates;
  console.log(route);
  const geojson = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: route,
    },
  };

  if (map.getSource("route")) {
    map.getSource("route").setData(geojson);
  } else {
    map.addLayer({
      id: "route",
      type: "line",
      source: {
        type: "geojson",
        data: geojson,
      },
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#3887be",
        "line-width": 5,
        "line-opacity": 0.75,
      },
    });
  }

  // Ensure this is outside the addLayer method
  map.on("load", () => {
    // Call the findRoute function on map load
    findRoute(map, start, end); // Call findRoute function with start and end points

    // Add starting point to the map
    map.addLayer({
      id: "point",
      type: "circle",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Point",
                coordinates: start,
              },
            },
          ],
        },
      },
      paint: {
        "circle-radius": 10,
        "circle-color": "#3887be",
      },
    });
  });
};

// // Example function for making a POST request
// export const postData = async (data) => {
//   try {
//     const response = await apiClient.post('/data', data);
//     return response.data;
//   } catch (error) {
//     console.error('Error posting data:', error);
//     throw error;
//   }
// };

// // Add other API call functions as needed
