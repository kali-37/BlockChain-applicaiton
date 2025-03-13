import axios from "axios";

async function getLevels() {
    const response = await axios.get("http://192.168.100.8:8000/api/levels/");
    console.log(response);
}

export default getLevels;
