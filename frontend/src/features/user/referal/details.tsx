import { Link } from "react-router";

function ReferalDetails() {
    return (
        <div className="grid grid-cols-1 gap-4 py-4">
            <p className="text-xl font-bold underline">Referral Details</p>
            <span className="text-gray-400">
                Copy the referal code and send it to the friend
            </span>
            <span className="text-gray-400">
                You must unlock Level 1 to access the referral link and share it
                with a friend
            </span>
            <Link to={`/user/rank-status`} className="btn">
                Unlock Level 1
            </Link>
        </div>
    );
}

export default ReferalDetails;
