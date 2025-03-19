import React, { useState } from "react";
import { GiFoxHead } from "react-icons/gi";
import { useNavigate, useLocation } from "react-router-dom";
import { connectWallet, authenticateWithWallet } from "../utils/authenticator";
import { api } from "../utils/api";

interface WalletConnectProps {
    onClose: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onClose }) => {
    const [account, setAccount] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const handleConnect = async () => {
        setLoading(true);
        setError(null);

        try {
            // Connect to wallet
            const walletAddress = await connectWallet();
            setAccount(walletAddress);

            // Check if we have a referrer from URL
            const params = new URLSearchParams(location.search);
            const referrer = params.get("ref");

            // Create or fetch profile
            const loginResponse = await api.post("/api/login/", {
                wallet_address: walletAddress,
                referrer_wallet: referrer || undefined,
            });
            console.log("LOG RESPONSE", loginResponse.data);

            // Authenticate with wallet signature
            await authenticateWithWallet(walletAddress);

            // Check if user is registered
            const { current_level, is_registered_on_chain } =
                loginResponse.data;
            setTimeout(() => {
                onClose();
                // Redirect based on user status
                if (
                    is_registered_on_chain &&
                    (current_level > 0 ||
                        loginResponse?.data?.is_profile_complete)
                ) {
                    navigate("/user/dashboard");
                } else {
                    navigate("/user/profile");
                }
            }, 1000);
        } catch (err: any) {
            // Check if it's the missing referrer error
            console.log(err.response);
            if (err.response?.status === 400) {
                const errorMessage = err.response?.data?.error;
                if (typeof errorMessage === "object") {
                    // Convert object of errors to a string if it's seraizlier error
                    setError(Object.values(errorMessage).flat().join(", "));
                } else {
                    setError(errorMessage || "An error occurred during login");
                }
                setLoading(false);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border-[1px] border-gray-700 w-[400px] bg-black p-6 text-center rounded-3xl">
            <h2 className="text-2xl font-bold mb-6">Connect Wallet</h2>

            {error ? (
                <div className="bg-red-500 bg-opacity-20 text-red-500 p-3 rounded-lg mb-4">
                    {error}
                </div>
            ) : account ? (
                <div className="space-y-4">
                    <p className="text-green-500">✓ Wallet Connected</p>
                    <p className="text-sm text-gray-400">
                        {account.slice(0, 6)}...{account.slice(-4)}
                    </p>
                    <p className="text-sm">Redirecting to dashboard...</p>
                </div>
            ) : (
                <div className="flex bg-gray-900 items-center gap-4 rounded-xl p-3 hover:bg-gray-800 cursor-pointer">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-[#FDEBD1]">
                        <GiFoxHead className="text-3xl text-[#F5841D]" />
                    </div>
                    <button
                        onClick={handleConnect}
                        disabled={loading}
                        className="flex-1 text-left text-white font-medium py-3 transition-colors duration-200"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <svg
                                    className="animate-spin h-5 w-5 mr-3"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                </svg>
                                Connecting...
                            </div>
                        ) : (
                            "Connect with MetaMask"
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default WalletConnect;
