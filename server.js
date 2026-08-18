const express = require('express');
const { initTables } = require('./db');
const cors = require("cors");
const buyersRouter = require('./buyers');
const demandsRouter = require('./demands');
const transportRouter = require('./transport');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/buyers', buyersRouter);
app.use('/demands', demandsRouter);
app.use('/transport-providers', transportRouter);

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Person B — buyers, demands, transport-providers API (MySQL)' });
});

const PORT = process.env.PORT || 4000;

initTables()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Person B's API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to set up database tables:', err.message);
    process.exit(1);
  });
