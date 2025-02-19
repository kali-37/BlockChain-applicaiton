import UserHeader from "../components/user/user-header";

interface UserLayoutProp {
    children: React.ReactNode;
}
function UserLayout({ children }: UserLayoutProp) {
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
