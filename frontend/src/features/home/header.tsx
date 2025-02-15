import { FaWallet } from "react-icons/fa6";
import LanguageBar from "./language-bar";
import { useState } from "react";

function Header() {
    const [openLanguageModal, setLanguageModal] = useState<boolean>(false);

    const handleLanguageModal = () => {
        setLanguageModal(!openLanguageModal);
    };
    return (
        <>
            <header className=" text-white pb-4 ">
                <div className="bg-gray-800 shadow-md shadow-gray-600 py-4">
                    <div className="flex w-[90%] md:w-[60%] mx-auto justify-between items-center  relative ">
                        <h1 className=" text-xl md:text-2xl font-semibold bg-gradient-to-r from-blue-200 via-blue-500 to-blue-800 text-transparent bg-clip-text ">
                            X CELRA
                        </h1>
                        <div className="flex items-center gap-4  ">
                            <div className="border-2 rounded-lg border-blue-600 border-opacity-0 hover:border-opacity-100">
                                <div className="flex items-center px-2 py-1 border-[1px] border-blue-600 gap-3 rounded-lg cursor-pointer hover:  ">
                                    <FaWallet />
                                    <p>Connect</p>
                                </div>
                            </div>
                            <div
                                className="border-2 rounded-xl border-blue-600 border-opacity-0 hover:border-opacity-100"
                                onClick={handleLanguageModal}
                            >
                                <div className="border-[1px] border-blue-600 p-[5px] rounded-xl cursor-pointer">
                                    <img
                                        src="https://ant-seiko.com/icon/country/en.svg"
                                        alt=""
                                    />
                                </div>
                            </div>
                        </div>
                        {openLanguageModal && (
                            <div className="absolute bg-gray-900 top-[120%] right-0 md:right-[-10%] z-50 rounded-xl w-[200px]">
                                <LanguageBar />
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}

export default Header;
