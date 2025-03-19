import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { TbMathGreater } from "react-icons/tb";
import Modal from "../../../components/ui/modal";
import ShareLink from "./share-link";
import { useGetUserProfile } from "../../../services/user/use-get-user-profile";
import { toast } from "react-toastify";

function SendInvites() {
    const [shareLink, setShareLink] = useState<boolean>(false);
    const { data: userProfile } = useGetUserProfile();

    const handleWallet = () => {
        if (userProfile?.current_level > 0) {
            setShareLink((prev) => !prev);
        } else {
            // window.location.href = "/user/rank-status";
            toast.info("Your level must be greater than 0 ");
        }
    };

    return (
        <>
            <div
                className="flex bg-blue-900 rounded-xl cursor-pointer hover:bg-blue-950 p-6 justify-between items-center shadow-md shadow-gray-500/50"
                onClick={handleWallet}
            >
                <div className="flex items-center gap-1 ">
                    <IoMdAdd className="text-2xl" />
                    <span>Send Invite</span>
                </div>
                <div>
                    <TbMathGreater />
                </div>
            </div>
            {shareLink ? (
                <Modal handleWallet={handleWallet}>
                    <ShareLink />
                </Modal>
            ) : (
                ""
            )}
        </>
    );
}

export default SendInvites;
