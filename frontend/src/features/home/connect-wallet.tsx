import { FaRegQuestionCircle } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { SiWalletconnect } from "react-icons/si";
import { GiFoxHead } from "react-icons/gi";
import { FaShieldAlt } from "react-icons/fa";
import { PiCirclesFourFill } from "react-icons/pi";

interface ConnectWalletProps {
    handleWallet: () => void;
}
// top-[50%] left-[50%] -translate-x-1/2 absolute z-[100]
function ConnectWallet({ handleWallet }: ConnectWalletProps) {
    return (
        <div className=" border-[1px] border-gray-700 w-[300px] bg-black p-6 rounded-3xl">
            <div className="flex items-center justify-between">
                <FaRegQuestionCircle className="cursor-pointer" />
                <p className="font-bold">ConnectWallet</p>
                <RxCross2
                    className="text-xl cursor-pointer"
                    onClick={handleWallet}
                />
            </div>
            <div className="flex flex-col gap-2 mt-4">
                <div className="flex bg-gray-900 items-center gap-4 rounded-xl p-3 hover:bg-gray-800 cursor-pointer ">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center  bg-blue-500">
                        <SiWalletconnect className="text-3xl" />
                    </div>
                    <p>WalletConnect</p>
                </div>
                <div className="flex bg-gray-900 items-center gap-4 rounded-xl p-3 hover:bg-gray-800 cursor-pointer ">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center  bg-[#FDEBD1]">
                        <GiFoxHead className="text-3xl text-[#F5841D]" />
                    </div>
                    <p>Meta Mask</p>
                </div>
                <div className="flex bg-gray-900 items-center gap-4 rounded-xl p-3 hover:bg-gray-800 cursor-pointer ">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center  bg-blue-500">
                        <FaShieldAlt className="text-3xl" />
                    </div>
                    <p>Trust Wallet</p>
                </div>
                <div className="flex bg-gray-900 items-center gap-4 rounded-xl p-3 hover:bg-gray-800 cursor-pointer ">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center  bg-gray-800">
                        <PiCirclesFourFill className="text-3xl text-blue-500" />
                    </div>
                    <p>All Wallets</p>
                </div>
            </div>
        </div>
    );
}

export default ConnectWallet;
