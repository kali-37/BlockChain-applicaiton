import ReferalDetails from "../../../features/user/referal/details";
import ReferalEarnings from "../../../features/user/referal/earnings";
import ReferalHeader from "../../../features/user/referal/header";

function Referal() {
    return (
        <div className="space-y-8">
            <p className="text-center font-semibold text-xl">Referal</p>
            <ReferalHeader />
            <ReferalEarnings />
            <ReferalDetails />
        </div>
    );
}

export default Referal;
