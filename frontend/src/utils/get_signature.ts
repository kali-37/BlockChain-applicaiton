import Web3 from "web3";
// require("dotenv").config();

/**
 * Signs a message with the private key from environment variables
 * @param {string} message - The message to sign
 * @returns {string} The hexadecimal signature
 */
async function getSignature(message: string) {
    try {
        // Initialize Web3
        const web3 = new Web3();

        // Get private key from environment variables
        const privateKey = process.env.PRIVATE_KEY;

        if (!privateKey) {
            throw new Error("Private key not found in environment variables");
        }

        // Sign the message with the private key
        const signedMessage = web3.eth.accounts.sign(message, privateKey);

        // Return the signature in hex format
        return signedMessage.signature;
    } catch (error) {
        console.error("Error signing message:", error);
        throw error;
    }
}

export default getSignature;
