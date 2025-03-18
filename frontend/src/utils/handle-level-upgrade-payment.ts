import { connectWallet } from "./authenticator";
import { UseMutateAsyncFunction } from "react-query"; // Adjust the import path if necessary

interface IHandleLevelProps {
    submitTransaction: UseMutateAsyncFunction<
        AxiosResponse<any, any>,
        Error,
        IHandleTransactionData,
        unknown
    >;
}
async function handleLevel0To1({
    submitTransaction,
    setProcessing,
    mutateAsync,
}) {
    setProcessing(true);
    // setError(null);
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
    console.log("wallet ==> ", walletAddress);

    if (!walletAddress) {
        setProcessing(false);
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
    const submitTransactionData = await submitTransaction({
        wallet_address: userWalletAddress,
        transaction_hash: transaction_hash,
    });
    console.log(submitTransactionData);
}

const handleLevelUpgradePayments = ({
    submitTransaction,
    setProcessing,
    mutateAsync,
}) => {
    handleLevel0To1({
        submitTransaction,
        setProcessing,
        mutateAsync,
    });
};

export default handleLevelUpgradePayments;
