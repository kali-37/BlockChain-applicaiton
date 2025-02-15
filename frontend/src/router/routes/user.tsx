import Dashboard from "../../pages/user/dashboard";

interface IUserRoute {
    id: number;
    path: string;
    component: React.FC;
}

const userRoutes: IUserRoute[] = [
    {
        id: 1,
        path: "/user/dashboard",
        component: Dashboard,
    },
];

export default userRoutes;
