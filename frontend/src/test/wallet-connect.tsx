import React, { useState, useEffect } from "react";
import { GiFoxHead } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import Web3, { MetaMaskProvider } from "web3";

interface WalletConnectProps {
    onClose: () => void;
}

declare global {
    interface Window {
        ethereum?: MetaMaskProvider<unknown>;
    }
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onClose }) => {
    const [account, setAccount] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const connectWallet = async () => {
        setLoading(true);
        setError(null);

        try {
            // Check if MetaMask is installed
            if (!window?.ethereum) {
                throw new Error("Please install MetaMask!");
            }
            console.log("ethererum ==> ", window?.ethereum);

            const web3 = new Web3(window?.ethereum);
            console.log("web3 ==> ", web3);

            // Request account access
            console.log(
                await window?.ethereum.request({
                    method: "eth_requestAccounts",
                })
            );
            await window?.ethereum.request({ method: "eth_requestAccounts" });

            // Get connected account
            const accounts = await web3.eth.getAccounts();
            console.log("accounts ==> ", accounts);
            const connectedAccount = accounts[0];

            setAccount(connectedAccount);

            // Store wallet info in localStorage
            localStorage.setItem("walletAddress", connectedAccount);

            // Close modal and redirect to dashboard
            setTimeout(() => {
                onClose();
                navigate("/user/dashboard");
            }, 1000);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to connect wallet"
            );
        } finally {
            setLoading(false);
        }
    };

    // Listen for account changes
    useEffect(() => {
        if (window?.ethereum) {
            window?.ethereum.on("accountsChanged", (accounts: string[]) => {
                setAccount(accounts[0] || null);
            });
        }

        return () => {
            if (window?.ethereum) {
                window?.ethereum.removeListener("accountsChanged", () => {});
            }
        };
    }, []);

    return (
        <div className="border-[1px] border-gray-700 w-[400px] bg-black p-6 text-center rounded-3xl">
            <h2 className="text-2xl font-bold mb-6 ">Connect Wallet</h2>

            {error && (
                <div className="bg-red-500 bg-opacity-20 text-red-500 p-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {account ? (
                <div className="space-y-4">
                    <p className="text-green-500">✓ Wallet Connected</p>
                    <p className="text-sm text-gray-400">
                        {account.slice(0, 6)}...{account.slice(-4)}
                    </p>
                    <p className="text-sm">Redirecting to dashboard...</p>
                </div>
            ) : (
                <div className="flex bg-gray-900 items-center gap-4 rounded-xl p-3 hover:bg-gray-800 cursor-pointer ">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center  bg-[#FDEBD1]">
                        <GiFoxHead className="text-3xl text-[#F5841D]" />
                    </div>
                    <button
                        onClick={connectWallet}
                        disabled={loading}
                        className="  text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
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
                            </>
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
