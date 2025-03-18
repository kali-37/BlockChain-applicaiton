import { Link } from "react-router";
import { useGetCurrentAndNextLevel } from "../../../../hooks/useGetCurrentNextLevel";
import { usePrepareTransaction } from "../../../../services/user/payment/use-prepare-transaction";
import { toast } from "react-toastify";
import { useState } from "react";
import { connectWallet } from "../../../../utils/authenticator";

interface INextLevel {
    level_number: number;
    price: string;
    min_direct_referrals: number;
    min_referral_depth: number;
}
interface CurrentAndNextLevel {
    currentLevel: number;
    nextLevelInfo: INextLevel;
}

function PaymentLayout({ nextLevelInfo, currentLevel }: CurrentAndNextLevel) {
    console.log(nextLevelInfo, currentLevel);
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
    const { mutateAsync } = usePrepareTransaction();
    const { currentLevel, nextLevelInfo } = useGetCurrentAndNextLevel();
    const [account, setAccount] = useState<string | null>(null);
    const [processing, setProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>();

    async function handleTransaction() {
        try {
            setProcessing(true);
            setError(null);
            let transactionData = null;

            // first phase for transaction
            const userWalletAddress = localStorage.getItem("walletAddress");
            if (userWalletAddress) {
                transactionData = await mutateAsync({
                    wallet_address: userWalletAddress,
                });
            } else {
                throw "No wallet Address";
            }

            console.log("transaction data==> ", transactionData);
            // transactionData.data.transaction

            // second phase for transaction .
            const walletAddress = await connectWallet();
            setAccount(walletAddress);
            console.log("wallet ==> ", walletAddress);

            if (!walletAddress) {
                setProcessing(false);
                return;
            }

            const response = await window?.ethereum?.request({
                method: "eth_sendTransaction",
                params: [
                    {
                        from: transactionData?.data?.transaction?.from, // The user's active address.
                        to: transactionData?.data?.transaction?.to, // Address of the recipient. Not used in contract creation transactions.
                        value: transactionData?.data?.transaction?.value, // Value transferred, in wei. Only required to send ether to the recipient from the initiating external account.
                        gasLimit: transactionData?.data?.transaction?.gasPrice, // Customizable by the user during MetaMask confirmation.
                        // maxPriorityFeePerGas: "0x3b9aca00", // Customizable by the user during MetaMask confirmation.
                        // maxFeePerGas: "0x2540be400", // Customizable by the user during MetaMask confirmation.
                    },
                ],
            });
            console.log("transaction detail==>", response);
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <>
            <div className="space-y-8">
                <p className="text-center text-xl  font-semibold ">
                    Make Payment
                </p>
                <PaymentLayout
                    currentLevel={currentLevel}
                    nextLevelInfo={nextLevelInfo}
                />
                {/* <div className="border border-gray-500"></div>
                <PaymentLayout /> */}
                <div className="border border-gray-500"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                    <a
                        // to={`/user/make-payment`}
                        className="bg-container text-center m-auto md:px-32 py-4 md:p-6 w-full hover:bg-blue-950"
                        onClick={handleTransaction}
                    >
                        Approve
                    </a>
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
