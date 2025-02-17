import React, { useState } from "react";
import { FaWallet } from "react-icons/fa";
import Modal from "./modal";
import WalletConnect from "./wallet-connect";

const HomePage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-8">
                        Welcome to Blockchain App
                    </h1>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors duration-200"
                    >
                        <FaWallet className="text-xl" />
                        <span>Connect Wallet</span>
                    </button>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <WalletConnect onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default HomePage;
