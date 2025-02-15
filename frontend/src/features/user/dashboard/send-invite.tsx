import { IoMdAdd } from "react-icons/io";
import { TbMathGreater } from "react-icons/tb";

function SendInvites() {
    return (
        <div className="flex bg-green-900 rounded-xl p-6 justify-between items-center">
            <div className="flex items-center gap-1 cursor-pointer">
                <IoMdAdd className="text-2xl" />
                <span>Send Invite</span>
            </div>
            <div>
                <TbMathGreater />
            </div>
        </div>
    );
}

export default SendInvites;
