import React, { useState } from "react";

interface Gens {
    gen1to3: boolean;
    gen4: boolean;
    gen5: boolean;
    gen6: boolean;
    gen7: boolean;
    gen8: boolean;
    gen9: boolean;
    gen10: boolean;
}

function GenLevels() {

     const [genActive, setGenActive] = useState<Gens>({
            gen1to3: true,
            gen4: false,
            gen5: false,
            gen6: false,
            gen7: false,
            gen8: false,
            gen9: false,
            gen10: false,
        });
    
        const handleActiveGen = (e: React.MouseEvent) => {
            const target = e.target as HTMLElement;
            console.log(target.dataset.gen);
    
            setGenActive((prev) => {
                const obj = { ...prev };
                for (const key in obj) {
                    if (key !== target.dataset.gen) {
                        obj[key as keyof Gens] = false;
                    }
                }
                obj[target.dataset.gen as keyof Gens] = true;
                console.log(obj);
                return obj;
            });
        };

    return (
        <div className="grid grid-cols-8 text-center border-b-2 border-gray-500 pb-2">
            <span
                className={`cursor-pointer ${
                    genActive.gen1to3 ? "gen-line" : ""
                } `}
                onClick={handleActiveGen}
                data-gen="gen1to3"
            >
                Gen 1-3
            </span>
            <span
                className={`cursor-pointer ${
                    genActive.gen4 ? "gen-line" : ""
                } `}
                onClick={handleActiveGen}
                data-gen="gen4"
            >
                Gen 4
            </span>
            <span
                className={`cursor-pointer ${
                    genActive.gen5 ? "gen-line" : ""
                } `}
                onClick={handleActiveGen}
                data-gen="gen5"
            >
                Gen 5
            </span>
            <span
                className={`cursor-pointer ${
                    genActive.gen6 ? "gen-line" : ""
                } `}
                onClick={handleActiveGen}
                data-gen="gen6"
            >
                Gen 6
            </span>
            <span
                className={`cursor-pointer ${
                    genActive.gen7 ? "gen-line" : ""
                } `}
                onClick={handleActiveGen}
                data-gen="gen7"
            >
                Gen 7
            </span>
            <span
                className={`cursor-pointer ${
                    genActive.gen8 ? "gen-line" : ""
                } `}
                onClick={handleActiveGen}
                data-gen="gen8"
            >
                Gen 8
            </span>
            <span
                className={`cursor-pointer ${
                    genActive.gen9 ? "gen-line" : ""
                } `}
                onClick={handleActiveGen}
                data-gen="gen9"
            >
                Gen 9
            </span>
            <span
                className={`cursor-pointer ${
                    genActive.gen10 ? "gen-line" : ""
                } `}
                onClick={handleActiveGen}
                data-gen="gen10"
            >
                Gen 10
            </span>
        </div>
    );
}

export default GenLevels;
