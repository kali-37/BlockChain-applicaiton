import axios from "axios";
import { refreshAccessToken } from "./authenticator";

// Create axios instance
export const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000",
});

// export function api():object=>{
//     if (localStorage.getItem(api)){
//         localStorage.api;
//     }
// }

// Set auth token in headersE
export const setAuthToken = (token: string): void => {
    console.log("setting api here ");
    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        localStorage.setItem("access_token", token);
    } else {
        // Remove token from headers if no token is provided
        delete api.defaults.headers.common["Authorization"];

        // Remove from localStorage as well
        localStorage.removeItem("access_token");
    }
};

// Remove auth tokens from headers
export const removeAuthTokens = (): void => {
    delete api.defaults.headers.common["Authorization"];
};

// Setup axios interceptors for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        console.log("api response ", error);
        if (
            (error.response?.status === 401 ||
                error.response?.data.detail == "Invalid or expired token") &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            try {
                // Try to refresh the token
                const refreshed = await refreshAccessToken();

                if (refreshed) {
                    // Retry the original request with new token
                    return api(originalRequest);
                }
            } catch (err) {
                console.error("Token refresh failed : ", err);
            }
        }

        return Promise.reject(error);
    }
);
