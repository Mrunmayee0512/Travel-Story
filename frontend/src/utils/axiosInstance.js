import axios from "axios";
import {BASE_URL} from "./constants";


const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        },
})

axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);



// Function to save user token dynamically in localStorage
export const saveUserToken = (newToken) => {
    let storedTokens = JSON.parse(localStorage.getItem("userTokens")) || [];

    if (!storedTokens.includes(newToken)) {
        storedTokens.push(newToken);
        localStorage.setItem("userTokens", JSON.stringify(storedTokens));
    }
};

// Function to retrieve all stored tokens
export const getUserTokens = () => {
    return JSON.parse(localStorage.getItem("userTokens")) || [];
};

// Function to remove a token (optional, for logout purposes)
export const removeUserToken = (tokenToRemove) => {
    let storedTokens = JSON.parse(localStorage.getItem("userTokens")) || [];
    storedTokens = storedTokens.filter(token => token !== tokenToRemove);
    localStorage.setItem("userTokens", JSON.stringify(storedTokens));
};



export default axiosInstance;