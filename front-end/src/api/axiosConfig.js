
import axios from 'axios';

// Create an Axios instance with default settings
const apiClient = axios.create({   //
  baseURL: 'http://localhost:4000/',  // Set your API base URL
  timeout: 3000,  // Set a default timeout (in milliseconds)
  headers: {
    'Content-Type': 'application/json',
     // Example for using token from local storage
  }
});
export default apiClient;