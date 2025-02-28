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
import { useLocation, useNavigate } from "react-router";
import { Link } from "react-router";
import { MdLogout } from "react-icons/md";

interface UserDrawerProps {
    open: boolean;
    handleDrawer: () => void;
}

function UserDrawer({ open, handleDrawer }: UserDrawerProps) {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    // console.log(location);

    const handleLogOut = () => {
        localStorage.removeItem("walletAddress");
        navigate("/");
    };
    return (
        <Drawer
            open={open}
            onClose={handleDrawer}
            direction="left"
            overlayOpacity={0.7}
            // overlayColor={"green"}
            overlayClassName="bg-red-400"
        >
            <aside className="bg-gray-800 h-full p-8 flex flex-col gap-8 overflow-y-auto">
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
                        <Link
                            to={`/user/dashboard`}
                            onClick={handleDrawer}
                            className={`flex items-center gap-2 ${
                                pathname === "/user/dashboard"
                                    ? "bg-blue-800"
                                    : ""
                            } p-2 cursor-pointer hover:bg-blue-800 rounded-md`}
                        >
                            <RxDashboard />
                            <p>Dashboard</p>
                        </Link>
                        <Link
                            to={`/user/rank-status`}
                            onClick={handleDrawer}
                            className={`flex items-center gap-2 cursor-pointer  p-2 hover:bg-blue-800 rounded-md ${
                                pathname === "/user/rank-status"
                                    ? "bg-blue-800"
                                    : ""
                            }`}
                        >
                            <RiVipCrownLine />
                            <p>Ranking Status</p>
                        </Link>
                    </div>
                </div>
                {/* ============================================================== */}
                <div className=" flex flex-col gap-4">
                    <p className="border-b-2 border-blue-400 inline">
                        Financial
                    </p>
                    <div className="space-y-2">
                        <Link
                            to={`/user/earning-overview`}
                            onClick={handleDrawer}
                            className={`flex items-center gap-2 cursor-pointer  p-2 hover:bg-blue-800 rounded-md ${
                                pathname === "/user/earning-overview"
                                    ? "bg-blue-800"
                                    : ""
                            }`}
                        >
                            <FaGift />
                            <p>Earnings Overview</p>
                        </Link>
                        <Link
                            to={`/user/transaction-history`}
                            onClick={handleDrawer}
                            className={`flex items-center gap-2 cursor-pointer  p-2 hover:bg-blue-800 rounded-md ${
                                pathname === "/user/transaction-history"
                                    ? "bg-blue-800"
                                    : ""
                            }`}
                        >
                            <MdHistory />
                            <p>Transaction History</p>
                        </Link>
                    </div>
                </div>
                {/* ============================================================== */}
                <div className=" flex flex-col gap-4">
                    <p className="border-b-2 border-blue-400 inline">
                        Networks
                    </p>
                    <div className="space-y-2">
                        <Link
                            to={`/user/referal`}
                            onClick={handleDrawer}
                            className={`flex items-center gap-2 cursor-pointer  p-2 hover:bg-blue-800 rounded-md ${
                                pathname === "/user/referal"
                                    ? "bg-blue-800"
                                    : ""
                            }`}
                        >
                            <VscReferences />
                            <p>Referral</p>
                        </Link>
                        <Link
                            to={`/user/genealogy`}
                            onClick={handleDrawer}
                            className={`flex items-center gap-2 cursor-pointer  p-2 hover:bg-blue-800 rounded-md ${
                                pathname === "/user/genealogy"
                                    ? "bg-blue-800"
                                    : ""
                            }`}
                        >
                            <PiTreeStructureFill />
                            <p>Genealogy</p>
                        </Link>
                    </div>
                </div>
                {/* ============================================================== */}
                <div className=" flex flex-col gap-4">
                    <p className="border-b-2 border-blue-400 inline">
                        Settings
                    </p>
                    <div className="space-y-2">
                        <Link
                            to={`/user/profile`}
                            onClick={handleDrawer}
                            className={`flex items-center gap-2 cursor-pointer  p-2 hover:bg-blue-800 rounded-md ${
                                pathname === "/user/profile"
                                    ? "bg-blue-800"
                                    : ""
                            }`}
                        >
                            <BsPersonCircle />
                            <p>Profile</p>
                        </Link>
                        <Link
                            to={`/user/faq`}
                            onClick={handleDrawer}
                            className={`flex items-center gap-2 cursor-pointer  p-2 hover:bg-blue-800 rounded-md ${
                                pathname === "/user/faq" ? "bg-blue-800" : ""
                            }`}
                        >
                            <BsPerson />
                            <p>FAQ</p>
                        </Link>
                    </div>
                </div>
                {/* ============================================================== */}
                <div className="cursor-pointer flex items-center gap-1">
                    <MdLogout className="text-xl font-semibold" />
                    <button className="font-semibold" onClick={handleLogOut}>
                        Log Out
                    </button>
                </div>
            </aside>
        </Drawer>
    );
}

export default UserDrawer;
