import { BrowserRouter, Route, Routes } from "react-router";
import Home from "../pages/home/home";
import userRoutes from "./routes/user";
import UserLayout from "../layout/user-layout";
import HomePage from "../test/home";

function Router() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    {userRoutes.map((userRoute) => (
                        <Route
                            key={userRoute.id}
                            path={userRoute.path}
                            element={
                                <UserLayout>
                                    <userRoute.component />
                                </UserLayout>
                            }
                        />
                    ))}
                    <Route path="/test" element={<HomePage />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default Router;
