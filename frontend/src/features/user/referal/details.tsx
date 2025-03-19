import { Link } from "react-router";
import { useGetUserProfile } from "../../../services/user/use-get-user-profile";

function ReferalDetails() {
    const { data: userProfile } = useGetUserProfile();
    console.log("userProfile ==> ", userProfile);

    return (
        <div className="grid grid-cols-1 gap-4 py-4">
            <p className="text-xl font-bold underline">Referral Details</p>

            <span className="text-gray-400">
                Copy the referal link and send it to the friend
            </span>
            {userProfile?.current_level > 0 ? (
                <div className="text-gray-400">
                    <span className="font-bold">Referral Link : </span>
                    <span>{`${window.location.origin}/?ref=${userProfile?.wallet_address}`}</span>
                </div>
            ) : (
                <>
                    <span className="text-gray-400">
                        You must unlock Level 1 to access the referral link and
                        share it with a friend
                    </span>
                    <Link to={`/user/rank-status`} className="btn">
                        Unlock Level 1
                    </Link>
                </>
            )}
        </div>
    );
}

export default ReferalDetails;
