import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Note: changed from "react-router" to "react-router-dom"
import { useGetCurrentAndNextLevel } from "../../../../hooks/useGetCurrentNextLevel";
import axios from "axios";
import { ethers } from "ethers";

// ERC20 ABI for USDT token interaction
const USDT_ABI = [
    // Only the functions we need
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function approve(address spender, uint256 amount) returns (bool)",
];

function PaymentLayout() {
    const { currentLevel, nextLevelInfo } = useGetCurrentAndNextLevel();

    return (
        <>
            <div className="grid grid-cols-1 font-light gap-2 px-4">
                <div className="flex justify-between items-center">
                    <p>Current Rank</p>
                    <p>Level {currentLevel}</p>
                </div>
                <div className="flex justify-between items-center">
                    <p>Next Rank</p>
                    <p>Level {nextLevelInfo?.level_number}</p>
                </div>
                <div className="flex justify-between items-center">
                    <p>Rank Price</p>
                    <p>{nextLevelInfo?.price} USDT</p>
                </div>
                <div className="flex justify-between items-center">
                    <p>Rank Fee</p>
                    <p>20 USDT</p>
                </div>
            </div>
        </>
    );
}

function MakePayment() {
    const { currentLevel, nextLevelInfo } = useGetCurrentAndNextLevel();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [transactionHash, setTransactionHash] = useState(null);
    const [walletAddress, setWalletAddress] = useState(null);

    // USDT contract address - should be set based on the network you're using
    const USDT_CONTRACT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // Ethereum Mainnet USDT

    // API endpoint for registration transaction
    const API_ENDPOINT = "/api/register/";

    useEffect(() => {
        // Check if metamask is installed
        if (typeof window.ethereum === "undefined") {
            setError(
                "MetaMask is not installed. Please install MetaMask to proceed."
            );
        }
    }, []);

    // Function to connect to metamask wallet
    const connectWallet = async () => {
        try {
            setError(null);
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            setWalletAddress(accounts[0]);
            return accounts[0];
        } catch (err) {
            console.error("Error connecting to MetaMask:", err);
            setError("Failed to connect to MetaMask. Please try again.");
            return null;
        }
    };

    // Function to check USDT balance
    const checkUSDTBalance = async (address) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const usdtContract = new ethers.Contract(
                USDT_CONTRACT_ADDRESS,
                USDT_ABI,
                provider
            );

            const balance = await usdtContract.balanceOf(address);
            const decimals = await usdtContract.decimals();

            // Convert balance to human-readable format
            const formattedBalance = ethers.utils.formatUnits(
                balance,
                decimals
            );
            return parseFloat(formattedBalance);
        } catch (err) {
            console.error("Error checking USDT balance:", err);
            throw new Error("Failed to check USDT balance");
        }
    };

    // Function to handle the payment approval
    const handleApprove = async () => {
        try {
            setProcessing(true);
            setError(null);

            // Connect to wallet first if not connected
            const address = walletAddress || (await connectWallet());
            if (!address) {
                setProcessing(false);
                return;
            }

            // Calculate total amount needed (price + fee)
            const totalAmount = parseFloat(nextLevelInfo?.price || 0) + 20; // 20 USDT fee

            // Check if user has enough USDT
            const usdtBalance = await checkUSDTBalance(address);
            if (usdtBalance < totalAmount) {
                setError(
                    `Insufficient USDT balance. You need ${totalAmount} USDT but only have ${usdtBalance.toFixed(
                        2
                    )} USDT.`
                );
                setProcessing(false);
                return;
            }

            // Prepare transaction - Phase 1
            const prepareResponse = await axios.post(
                API_ENDPOINT,
                {
                    wallet_address: address,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "access_token"
                        )}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const { transaction } = prepareResponse.data;

            // Sign transaction with metamask
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            // Request user to sign the transaction
            const signedTransaction = await signer.signTransaction(transaction);

            // Submit signed transaction - Phase 2
            const submitResponse = await axios.post(
                API_ENDPOINT,
                {
                    wallet_address: address,
                    signed_transaction: signedTransaction,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "access_token"
                        )}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            // Handle successful transaction
            setSuccess(true);
            setTransactionHash(submitResponse.data.transaction_hash);

            // Optionally redirect after success
            // window.location.href = '/user/rank-status';
        } catch (err) {
            console.error("Transaction error:", err);
            setError(
                err.response?.data?.message ||
                    "Transaction failed. Please try again."
            );
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <div className="space-y-8">
                <p className="text-center text-xl font-semibold">
                    Make Payment
                </p>
                <PaymentLayout />
                <div className="border border-gray-500"></div>

                {/* Display errors if any */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <p>{error}</p>
                    </div>
                )}

                {/* Display success message */}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        <p>
                            Payment successful! Transaction hash:{" "}
                            {transactionHash}
                        </p>
                    </div>
                )}

                {/* Display wallet connection status */}
                {walletAddress && (
                    <div className="text-center">
                        <p>
                            Connected wallet: {walletAddress.slice(0, 6)}...
                            {walletAddress.slice(-4)}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={handleApprove}
                        disabled={processing || success}
                        className={`bg-container text-center m-auto md:px-32 py-4 md:p-6 w-full hover:bg-blue-950 ${
                            processing ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {processing ? "Processing..." : "Approve"}
                    </button>
                    <Link
                        to={`/user/rank-status`}
                        className="bg-container text-center m-auto md:px-32 py-4 md:p-6 w-full hover:bg-blue-950"
                    >
                        Back
                    </Link>
                </div>
            </div>
        </>
    );
}

export default MakePayment;
