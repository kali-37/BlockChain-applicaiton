import { CgMenuLeft } from "react-icons/cg";
import { PiWalletLight } from "react-icons/pi";
import { LiaBullhornSolid } from "react-icons/lia";
import { useState } from "react";
import UserDrawer from "../../features/user/sidebar";

function UserHeader() {
    const [isDrawerOpen, setDrawerOpen] = useState(false);

    const handleDrawerOpenClose = () => {
        setDrawerOpen((prev) => !prev);
    };
    return (
        <>
            <header className="py-6">
                <div className="flex justify-between w-[90%] mx-auto items-center max-w-[900px] ">
                    <div className="flex items-center gap-2">
                        <div
                            className="bg-gray-800 p-2 cursor-pointer"
                            onClick={handleDrawerOpenClose}
                        >
                            <CgMenuLeft className="text-xl md:text-3xl text-blue-400" />
                        </div>
                        <h1 className="font-semibold text-xl md:text-2xl">
                            XCLERA
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center border-[1px] cursor-pointer border-blue-300 rounded-xl gap-1 p-1">
                            <PiWalletLight className="text-xl md:text-2xl" />
                            <p>Ox*****a</p>
                        </div>
                        <div className="p-2 border-blue-300 border-[1px] rounded-3xl cursor-pointer">
                            <LiaBullhornSolid className="text-xl md:text-2xl" />
                        </div>
                    </div>
                </div>
            </header>
            <UserDrawer
                open={isDrawerOpen}
                handleDrawer={handleDrawerOpenClose}
            />
        </>
    );
}

export default UserHeader;
