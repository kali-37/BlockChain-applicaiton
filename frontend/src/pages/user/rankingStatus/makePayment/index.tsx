import { Link } from "react-router";
import { useGetCurrentAndNextLevel } from "../../../../hooks/useGetCurrentNextLevel";
import { usePrepareTransaction } from "../../../../services/user/payment/use-prepare-transaction";
import { useState } from "react";
import { connectWallet } from "../../../../utils/authenticator";
import { useSubmitSignedTransaction } from "../../../../services/user/payment/use-submit-signed-transaction";
import { toast } from "react-toastify";
import { useGetUserProfile } from "../../../../services/user/use-get-user-profile";
import { usePrepareTransactionForRemainingLevels } from "../../../../services/user/payment/use-prepare-transaction-remaining-levels";
import { useSubmitSignedTransactionRemainingLevels } from "../../../../services/user/payment/use-submit-signed-transactions-remaining-levels";

interface INextLevel {
    level_number: number;
    price: string;
    min_direct_referrals: number;
    min_referral_depth: number;
    rank_fee: string;
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
                    <p>{nextLevelInfo?.rank_fee} USDT</p>
                </div>
            </div>
        </>
    );
}

function MakePayment() {
    const { mutateAsync: prepareTransaction } = usePrepareTransaction();
    const { mutateAsync: submitTransaction } = useSubmitSignedTransaction();
    const { mutateAsync: prepareTransactionRemainingLevels } =
        usePrepareTransactionForRemainingLevels();
    const { mutateAsync: submitTransactionRemainingLevels } =
        useSubmitSignedTransactionRemainingLevels();
    const { currentLevel, nextLevelInfo } = useGetCurrentAndNextLevel();
    const { data: userProfile } = useGetUserProfile();
    const [processing, setProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function handleTransaction() {
        try {
            setProcessing(true);
            // setError(null);
            let transactionData = null;
            let submitTransactionData = null;

            // =============first phase for transaction=====================
            const userWalletAddress = localStorage.getItem("walletAddress");
            if (userWalletAddress) {
                // level 0 to level 1
                if (userProfile?.current_level < 1) {
                    transactionData = await prepareTransaction({
                        wallet_address: userWalletAddress,
                    });
                } else {
                    //  level 1 to above remaining levels
                    transactionData = await prepareTransactionRemainingLevels({
                        wallet_address: userWalletAddress,
                    });
                }
            } else {
                throw "No wallet Address";
            }

            console.log("transaction data==> ", transactionData);
            // transactionData.data.transaction

            // second phase for transaction .
            const walletAddress = await connectWallet();
            console.log("wallet ==> ", walletAddress);

            if (!walletAddress) {
                setProcessing(false);
                toast.error(
                    "Failed to connect to your wallet . Try again letter"
                );
                return;
            }

            const transaction_hash = await window?.ethereum?.request({
                method: "eth_sendTransaction",
                params: [
                    {
                        from: transactionData?.data?.transaction?.from, // The user's active address.
                        to: transactionData?.data?.transaction?.to, // Address of the recipient. Not used in contract creation transactions.
                        value: transactionData?.data?.transaction?.value, // Value transferred, in wei. Only required to send ether to the recipient from the initiating external account.
                        gasLimit: transactionData?.data?.transaction?.gasPrice, // Customizable by the user during MetaMask confirmation.
                    },
                ],
            });

            console.log("transaction detail==>", transaction_hash);
            console.log({
                wallet_address: userWalletAddress,
                signed_transaction: transaction_hash,
            });

            // level 0 to level 1
            if (userProfile?.current_level < 1) {
                submitTransactionData = await submitTransaction({
                    wallet_address: userWalletAddress,
                    transaction_hash: transaction_hash,
                });
                console.log(submitTransactionData);
            } else {
                //  level 1 to above remaining levels
                submitTransactionData = await submitTransactionRemainingLevels({
                    wallet_address: userWalletAddress,
                    transaction_hash: transaction_hash,
                });
            }
        } catch (error) {
            console.log(error);
            console.log(error?.response?.data?.error);
            setError(error?.response?.data?.error);
            toast.error(
                error?.response?.data?.error ||
                    "Failed to complete transaction. Please try again later"
            );
        } finally {
            setProcessing(false);
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
                        {processing ? "Processing....." : "Approve"}
                    </a>
                    <Link
                        to={`/user/rank-status`}
                        className="bg-container text-center m-auto md:px-32 py-4 md:p-6 w-full hover:bg-blue-950"
                    >
                        Back
                    </Link>
                </div>
                {error ? (
                    <div className="font-bold text-lg text-red-700">
                        <span>NOTE : </span>
                        <span>{error}</span>
                    </div>
                ) : (
                    ""
                )}
            </div>
        </>
    );
}

export default MakePayment;
