//export const BASE_URL = "http://localhost:5000"
/*export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "http://backend:5000"   // inside Docker network
    : "http://localhost:5000"; // when running locally*/

export const BASE_URL = import.meta.env.VITE_API_URL;
    
