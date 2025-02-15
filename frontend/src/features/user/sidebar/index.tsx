import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import { IoCloseSharp } from "react-icons/io5";
import { RxDashboard } from "react-icons/rx";
import { RiVipCrownLine } from "react-icons/ri";
import { BsPerson } from "react-icons/bs";
import { BsPersonCircle } from "react-icons/bs";
import { PiTreeStructureFill } from "react-icons/pi";
import { VscReferences } from "react-icons/vsc";
import { FaGift } from "react-icons/fa6";
import { MdHistory } from "react-icons/md";

interface UserDrawerProps {
    open: boolean;
    handleDrawer: () => void;
}

function UserDrawer({ open, handleDrawer }: UserDrawerProps) {
    return (
        <Drawer
            open={open}
            onClose={handleDrawer}
            direction="left"
            overlayOpacity={0.7}
            // overlayColor={"green"}
            overlayClassName="bg-red-400"
        >
            <aside className="bg-gray-800 h-full p-8 flex flex-col gap-8">
                <div>
                    <IoCloseSharp
                        className="text-3xl cursor-pointer text-blue-500"
                        onClick={handleDrawer}
                    />
                </div>
                <div className=" flex flex-col gap-4">
                    <p className="border-b-2 border-blue-400 inline">
                        Main Menu
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 bg-blue-800 p-2 cursor-pointer hover:bg-blue-800 rounded-md">
                            <RxDashboard />
                            <p>Dashboard</p>
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer  p-2 hover:bg-blue-800 rounded-md">
                            <RiVipCrownLine />
                            <p>Ranking Status</p>
                        </div>
                    </div>
                </div>
                {/* ============================================================== */}
                <div className=" flex flex-col gap-4">
                    <p className="border-b-2 border-blue-400 inline">
                        Financial
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 cursor-pointer hover:bg-blue-800 rounded-md">
                            <FaGift />
                            <p>Earnings Overview</p>
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer p-2 hover:bg-blue-800 rounded-md">
                            <MdHistory />
                            <p>Transaction History</p>
                        </div>
                    </div>
                </div>
                {/* ============================================================== */}
                <div className=" flex flex-col gap-4">
                    <p className="border-b-2 border-blue-400 inline">
                        Networks
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 cursor-pointer hover:bg-blue-800 rounded-md">
                            <VscReferences />
                            <p>Referral</p>
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer p-2 hover:bg-blue-800 rounded-md">
                            <PiTreeStructureFill />
                            <p>Genealogy</p>
                        </div>
                    </div>
                </div>
                {/* ============================================================== */}
                <div className=" flex flex-col gap-4">
                    <p className="border-b-2 border-blue-400 inline">
                        Settings
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 cursor-pointer hover:bg-blue-800 rounded-md">
                            <BsPersonCircle />
                            <p>Profile</p>
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer p-2 hover:bg-blue-800 rounded-md">
                            <BsPerson />
                            <p>FAQ</p>
                        </div>
                    </div>
                </div>
                {/* ============================================================== */}
            </aside>
        </Drawer>
    );
}

export default UserDrawer;
