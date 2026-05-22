const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
console.log('DATABASE_URL:', process.env.DATABASE_URL);
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/search', require('./routes/search'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/bookings', require('./routes/bookings'));

app.get('/', (req, res) => {
  res.send('SkillSwap API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
