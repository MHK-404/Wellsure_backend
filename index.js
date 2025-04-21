const express = require('express');
const cors = require('cors');
const assessRouter = require('./api/assess');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/assess', assessRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
