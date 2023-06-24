import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { Pool } from "pg";
import fs from "fs";
import path from "path";

export interface Log {
  unix_ts: number;
  user_id: number;
  event_name: "login" | "logout";
}

const app = express();
app.use(bodyParser.json());

const pool = new Pool({
  user: "postgres",
  host: "db",
  database: "postgres",
  password: "password",
  port: 5432,
});

const bufferFile = path.join(__dirname, "buffer.json");
let buffer: Log[] = [];

const loadBuffer = () => {
  if (fs.existsSync(bufferFile)) {
    const data = fs.readFileSync(bufferFile, "utf-8");
    buffer = JSON.parse(data);
  }
};

const saveBuffer = () => {
  fs.writeFileSync(bufferFile, JSON.stringify(buffer));
};

const flushBuffer = async () => {
  if (buffer.length > 0) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const query =
        "INSERT INTO logs (unix_ts, user_id, event_name) VALUES ($1, $2, $3)";
      for (const log of buffer) {
        await client.query(query, [log.unix_ts, log.user_id, log.event_name]);
      }
      await client.query("COMMIT");
      buffer.length = 0;
      saveBuffer();
    } catch (err) {
      console.error("Error during transaction", err);
      await client.query("ROLLBACK");
    } finally {
      client.release();
    }
  }
};

loadBuffer();
setInterval(flushBuffer, 30000);

app.post("/log", (req: Request, res: Response) => {
  buffer.push(req.body);
  saveBuffer();
  if (Buffer.byteLength(JSON.stringify(buffer)) > 10 * 1024 * 1024) {
    flushBuffer();
  }
  res.sendStatus(200);
});

app.get("/getLogs", async (_, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM logs");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching logs", err);
    res.status(500).json({ error: "Error fetching logs" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
