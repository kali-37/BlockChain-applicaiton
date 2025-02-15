import UserHeader from "../components/header/user-header";

interface UserLayoutProp {
    children: React.ReactNode;
}
function UserLayout({ children }: UserLayoutProp) {
    return (
        <>
            <UserHeader />
            <div className="w-[80%] max-w-[900px] py-4 space-y-8 mx-auto">
                {children}
            </div>
        </>
    );
}

export default UserLayout;
