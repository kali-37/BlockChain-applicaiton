import { api, setAuthToken, removeAuthTokens } from "./api";
import { getAddress } from "ethers";

declare global {
    interface Window {
        ethereum?: import("ethers").Eip1193Provider | undefined;
    }
}
interface AuthTokens {
    access_token: string;
    refresh_token: string;
    access_expires_at: string;
    refresh_expires_at: string;
    wallet_address: string;
}

interface NonceResponse {
    message: string;
    nonce: string;
}

// Utility to check if window.ethereum is available
const isMetaMaskAvailable = (): boolean => {
    return typeof window !== "undefined" && !!window.ethereum;
};

// Connect to MetaMask wallet
export const connectWallet = async (): Promise<string> => {
    if (!isMetaMaskAvailable()) {
        throw new Error("MetaMask is not installed");
    }

    try {
        // Request accounts
        if (!window.ethereum) {
            throw new Error("Ethereum provider is not available");
        }
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });

        const account = accounts[0];
        const checksummedAddress = getAddress(account); // converts to checksum format as metamask provides lowecase address
        localStorage.setItem("walletAddress", checksummedAddress);
        return checksummedAddress;
    } catch (error) {
        console.error("Error connecting to wallet:", error);
        throw error;
    }
};

// Request signature from user and authenticate
export const authenticateWithWallet = async (
    walletAddress: string
): Promise<AuthTokens> => {
    try {
        // Get nonce from server
        const nonceResponse = await api.get<NonceResponse>(
            `/api/auth/nonce/${walletAddress}/`
        );
        const { message, nonce } = nonceResponse.data;

        // Request signature from MetaMask
        if (!window.ethereum) {
            throw new Error("Ethereum provider is not available");
        }
        const signature = await window.ethereum.request({
            method: "personal_sign",
            params: [message, walletAddress],
        });

        // Verify signature with backend and get tokens
        const authResponse = await api.post<AuthTokens>(
            "/api/auth/authenticate/",
            {
                wallet_address: walletAddress,
                signature,
                nonce,
            }
        );
        console.log(authResponse);

        // Store tokens
        const { access_token, refresh_token } = authResponse.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);

        // Set authorization header
        setAuthToken(access_token);

        return authResponse.data;
    } catch (error) {
        console.error("Authentication error:", error);
        throw error;
    }
};

// Refresh access token using refresh token
export const refreshAccessToken = async (): Promise<boolean> => {
    const refresh_token = localStorage.getItem("refresh_token");

    if (!refresh_token) {
        return false;
    }

    try {
        const response = await api.post<{
            access_token: string;
            expires_at: string;
        }>("/api/auth/refresh/", {
            refresh_token,
        });

        localStorage.setItem("access_token", response.data.access_token);
        setAuthToken(response.data.access_token);

        return true;
    } catch (error) {
        console.error("Token refresh failed:", error);
        logout();
        return false;
    }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem("access_token");
};

// Logout - clear all tokens
export const logout = (): void => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("walletAddress");
    // removeAuthTokens();
};

// Initialize auth from localStorage (call on app start)
export const initializeAuth = (): void => {
    const token = localStorage.getItem("access_token");
    if (token) {
        setAuthToken(token);
    }
};

export const getToken = function () {
    return localStorage.getItem("access_token");
};
