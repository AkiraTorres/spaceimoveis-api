import Express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = Express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.all("*", (req, res) => {
    res.status(404).send("Not Found");
});

app.listen(process.env.PORT, () => {
    console.log(`\u001B[32mServer is running on http://localhost:${process.env.PORT}\u001B[0m`);
});
