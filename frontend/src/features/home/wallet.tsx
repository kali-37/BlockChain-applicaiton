import { FaWallet } from "react-icons/fa6";
import ConnectWallet from "../../features/home/connect-wallet";
import Modal from "../../components/ui/modal";
import { useState } from "react";

function Wallet() {
    const [openWallet, setOpenWallet] = useState<boolean>(false);

    const handleWallet = () => {
        setOpenWallet((prev) => !prev);
    };
    return (
        <>
            <section className="bg-black text-white h-[90.5vh] p-4 overflow-hidden">
                <div className=" w-[90%]  md:w-[50%] mx-auto h-[80%] relative ">
                    <div className=" flex flex-col -rotate-90 z-40 absolute top-[20%] md:top-[2%] left-[-8%] md:left-[-4%] min-w-[80%] md:min-w-[70%]">
                        <div className="flex items-center gap-2">
                            <div className="w-[17%] border-t-2"></div>
                            <p className="text-blue-600">
                                WELCOME TO ANT ALLIANCE
                            </p>
                        </div>
                        <h2 className="ml-[50px] text-3xl font-semibold">
                            CRYPTO RUSH
                        </h2>
                    </div>
                    <div className="h-[80vh]  w-full  bg-ant bg-no-repeat bg-contain md:bg-contain md:bg-left-top absolute left-[-20%] top-[20%] md:left-[-5%] md:top-[5%] z-20"></div>
                    <div className="bg-coin h-[150px] w-[150px] z-10 absolute bg-no-repeat bg-cover left-[50%]"></div>
                    <div className="bg-coin h-[70px] w-[70px] bg-cover bg-no-repeat absolute right-[5%] top-[50%] ">
                        <div className="h-full w-full bg-black bg-opacity-60"></div>
                    </div>
                    <div className=" z-30 absolute bottom-[10%] md:bottom-[-10%] w-[80%] left-[50%] -translate-x-1/2 grid grid-cols-1 space-y-4">
                        <div
                            onClick={handleWallet}
                            className="bg-blue-700 hover:bg-blue-900 cursor-pointer py-4 rounded-lg flex items-center justify-center gap-3 "
                        >
                            <span>
                                <FaWallet className="text-xl" />
                            </span>
                            <button className="text-xl">Link Wallet</button>
                        </div>
                        <p className="text-2xl text-center text-blue-500">
                            Begin by linking wallet
                        </p>
                    </div>
                </div>

                {openWallet && (
                    <Modal handleWallet={handleWallet}>
                        <ConnectWallet handleWallet={handleWallet} />
                    </Modal>
                )}
            </section>
        </>
    );
}

export default Wallet;
