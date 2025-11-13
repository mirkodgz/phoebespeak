import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import practiceRouter from './routes/practice';

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors());
app.use((req, _res, next) => {
  console.info(`[${req.method}] ${req.originalUrl}`);
  next();
});
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({status: 'ok'});
});

app.use('/practice', practiceRouter);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error('[backend] unexpected error', err);
    res.status(500).json({error: err.message || 'Internal Server Error'});
  },
);

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});

