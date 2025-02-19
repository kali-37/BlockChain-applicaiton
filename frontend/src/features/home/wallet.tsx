import { FaWallet } from "react-icons/fa6";
import ConnectWallet from "../../features/home/connect-wallet";
import Modal from "../../components/ui/modal";
import ant from "../../assets/img/ant.png";
import coin from "../../assets/img/coin.png";
import { useState } from "react";
import WalletConnect from "../../test/wallet-connect";

function Wallet() {
    const [openWallet, setOpenWallet] = useState<boolean>(false);

    const handleWallet = () => {
        setOpenWallet((prev) => !prev);
    };
    return (
        <>
            <section className="bg-black p-8  min-h-[80vh] flex items-center justify-center overflow-x-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 space-y-8 md:space-y-0 md:space-x-20 w-[80%] max-w-[1000px] mx-auto ">
                    <div className=" flex justify-center items-center relative ">
                        <img
                            src={coin}
                            className={`absolute h-28 w-h-28 top-0 right-[-20%] md:right-[-10%]`}
                            alt=""
                            //
                        />
                        <img
                            src={coin}
                            className="absolute h-28 w-h-28 top-0 left-[-20%] md:left-[-10%]"
                            alt=""
                        />
                        <img
                            src={ant}
                            alt=""
                            className="h-200px md:h-[350px] w-200px md:w-[350px] object-contain z-10  "
                        />
                        <img
                            src={coin}
                            className="absolute h-20 w-h-20 bottom-20 right-[-10%] opacity-50"
                            alt=""
                        />
                        <img
                            src={coin}
                            className="absolute h-20 w-h-20 bottom-20 left-[-10%] opacity-50"
                            alt=""
                        />
                    </div>
                    <div className=" flex flex-col items-center bg-no-repeat bg-center justify-center gap-7 p-8">
                        <h2 className=" text-2xl md:text-4xl  text-center">
                            Welcome to{" "}
                            <span className="bg-gradient-to-r from-blue-200 via-blue-500 to-blue-800 text-transparent bg-clip-text font-bold">
                                X-CELRA
                            </span>
                        </h2>
                        <p className="text-xl text-gray-400 text-center">
                            A blockchain platform
                        </p>
                        <div
                            onClick={handleWallet}
                            className="bg-blue-700 hover:bg-blue-900 cursor-pointer py-4 px-10 rounded-lg flex items-center justify-center gap-3 shadow-md shadow-gray-700 "
                        >
                            <span>
                                <FaWallet className="text-xl" />
                            </span>
                            <button className="text-xl font-semibold">
                                Link Your Wallet
                            </button>
                        </div>
                    </div>
                </div>
                {openWallet && (
                    <Modal handleWallet={handleWallet}>
                        {/* <ConnectWallet handleWallet={handleWallet} /> */}
                        <WalletConnect onClose={() => setOpenWallet(false)} />
                    </Modal>
                )}
            </section>
        </>
    );
}

export default Wallet;
