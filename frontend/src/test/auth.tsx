import Web3 from "web3";
const generateSignature = async ({ message, privateKey }) => {
    try {
        setError("");
        const web3 = new Web3();

        // Create the message hash
        const messageHash = web3.eth.accounts.hashMessage(message);

        // Sign the message hash with the private key
        const signedMessage = web3.eth.accounts.sign(message, privateKey);

        // Get the signature
        setSignature(signedMessage.signature);
    } catch (err) {
        setError(`Error generating signature: ${err.message}`);
        console.error(err);
    }
};

export default generateSignature;
