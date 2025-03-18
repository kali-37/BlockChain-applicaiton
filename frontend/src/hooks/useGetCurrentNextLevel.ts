import { useEffect, useState } from "react";
import { useGetUserProfile } from "../services/user/use-get-user-profile";
import { useGetAllLevels } from "../services/user/use-getLevels";

interface Level {
    level_number: number;
    min_direct_referals: number;
    min_referral_depth: number;
    price: string;
}

export const useGetCurrentAndNextLevel = () => {
    const { data: levels } = useGetAllLevels();
    const { data: userProfile } = useGetUserProfile();

    const [currentLevel, setCurrentLevel] = useState<number>(0);

    const nextLevelInfo = levels?.results.find(
        (level: Level) => level.level_number === userProfile?.current_level + 1
    );
    console.log(nextLevelInfo);

    useEffect(() => {
        setCurrentLevel(userProfile?.current_level);
    }, [userProfile?.current_level]);

    return { levels, currentLevel, nextLevelInfo };
};
