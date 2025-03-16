import { http } from "../../lib/http";

async function getLevels() {
    const response = await http.get("/api/levels/");
    console.log(response);
}

export default getLevels;
