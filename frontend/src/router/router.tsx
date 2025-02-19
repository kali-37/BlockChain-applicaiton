import { BrowserRouter, Route, Routes } from "react-router";
import userRoutes from "./routes/user";
import UserLayout from "../layout/user-layout";
import HomePage from "../test/home";
import { lazy, Suspense } from "react";
import Loading from "../components/ui/loader";

const Home = lazy(() => import("../pages/home/home"));

function Router() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <Suspense fallback={<Loading />}>
                                <Home />
                            </Suspense>
                        }
                    />
                    {userRoutes.map((userRoute) => (
                        <Route
                            key={userRoute.id}
                            path={userRoute.path}
                            element={
                                <UserLayout>
                                    <Suspense fallback={<Loading />}>
                                        <userRoute.component />
                                    </Suspense>
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
