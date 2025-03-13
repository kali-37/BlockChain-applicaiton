interface TransactionType {
    from: string;
    to: string;
    value: string; // 115 ETH in wei
    data: string;
    chainId: number;
    gas: number;
    gasPrice: number;
    nonce: number;
}

async function signTransaction(transaction: TransactionType) {
    try {
        // Check if MetaMask is installed
        if (typeof window.ethereum === "undefined") {
            throw new Error("MetaMask is not installed");
        }

        // Request account access if needed
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        console.log("Accounts : ", accounts);
        const transaction = {
            from: "0xF3a9b16Dc47a83EeA10940294a1Bc5C7613ede9F",
            to: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
            value: "0x" + BigInt(115000000000000000000).toString(16),
            chainId: 31337, // chainId might be acceptable as a number in some cases
            gas: "0x" + BigInt(2000000).toString(16),
            gasPrice: "0x" + BigInt(1602553565).toString(16),
            nonce: "0x" + BigInt(0).toString(16),
            data: "0x4420e486000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        };

        window.ethereum
            .request({
                method: "eth_sendTransaction",
                params: [transaction],
            })
            .then((result) => {
                console.log(result);
                // The result varies by RPC method.
                // For example, this method returns a transaction hash hexadecimal string upon success.
            })
            .catch((error) => {
                console.log(error);
                // If the request fails, the Promise rejects with an error.
            });

        // // Sign the transaction
        // const signedTx = await window.ethereum.request({
        //     method: "eth_sendTransaction",
        //     params: [transaction],
        // });

        // console.log("Signed transaction hash:", signedTx);

        // // You can then send this signed transaction back to your backend
        // return signedTx;
    } catch (error) {
        console.log("Err  or signing transaction:");
        throw error;
    }
}

export default signTransaction;
