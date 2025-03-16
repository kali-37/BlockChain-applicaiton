import { Navigate } from "react-router";
import UserHeader from "../components/user/user-header";
import { isAuthenticated } from "../utils/authenticator";

interface UserLayoutProp {
    children: React.ReactNode;
}
function UserLayout({ children }: UserLayoutProp) {
    if (!isAuthenticated()) {
        return <Navigate to={`/`} />;
    }

    return (
        <>
            <UserHeader />
            <div className="w-[80%] max-w-[900px] py-4 space-y-10 mx-auto">
                {children}
            </div>
        </>
    );
}

export default UserLayout;
