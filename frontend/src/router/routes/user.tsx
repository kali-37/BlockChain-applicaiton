import { lazy } from "react";

const Dashboard = lazy(() => import("../../pages/user/dashboard"));
const EarningOverview = lazy(() => import("../../pages/user/earningOverview"));
const Faq = lazy(() => import("../../pages/user/FAQ"));
const Genealogy = lazy(() => import("../../pages/user/genealogy"));
const UserProfile = lazy(() => import("../../pages/user/profile"));
const RankingStatus = lazy(() => import("../../pages/user/rankingStatus"));
const Referal = lazy(() => import("../../pages/user/referal"));
const TransactionHistory = lazy(
    () => import("../../pages/user/transactionHistory")
);

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
    {
        id: 2,
        path: "/user/rank-status",
        component: RankingStatus,
    },
    {
        id: 3,
        path: "/user/earning-overview",
        component: EarningOverview,
    },
    {
        id: 4,
        path: "/user/transaction-history",
        component: TransactionHistory,
    },
    {
        id: 5,
        path: "/user/referal",
        component: Referal,
    },
    {
        id: 6,
        path: "/user/genealogy",
        component: Genealogy,
    },
    {
        id: 7,
        path: "/user/profile",
        component: UserProfile,
    },
    {
        id: 8,
        path: "/user/faq",
        component: Faq,
    },
];

export default userRoutes;
