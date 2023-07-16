import cors from "cors";
import express, { Request, Response } from "express";

const app = express();
const originList = ["http://localhost:3000", "http://localhost:3001"];

app.use(express.json()); // bodyParser가 express 최근 버전에서 deprecated되어서 다음과 같이 처리해줘야함
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: originList,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// 이미지 폴더 접근 권한 허용
app.use("/uploads", express.static(__dirname + "/uploads"));

app.get("/test", (req: Request, res: Response) => {
  res.send("server is listening on 3000");
});

export default app;
