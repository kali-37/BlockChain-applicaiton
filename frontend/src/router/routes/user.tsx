import Dashboard from "../../pages/user/dashboard";
import EarningOverview from "../../pages/user/earningOverview";
import Faq from "../../pages/user/FAQ";
import Genealogy from "../../pages/user/genealogy";
import UserProfile from "../../pages/user/profile";
import RankingStatus from "../../pages/user/rankingStatus";
import Referal from "../../pages/user/referal";
import TransactionHistory from "../../pages/user/transactionHistory";

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
        id : 5 ,
        path : "/user/referal" ,
        component : Referal
    },
    {
        id : 6 , 
        path : "/user/genealogy",
        component : Genealogy
    }
    ,
    {
        id : 7 ,
        path : "/user/profile" ,
        component : UserProfile
    }
    ,
    {
        id : 8 ,
        path : "/user/faq" ,
        component : Faq
    }
];

export default userRoutes;
