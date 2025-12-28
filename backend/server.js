import express from 'express';
import cors from 'cors';

import mentorRoutes from './routes/mentors.js';
import menteeRoutes from './routes/mentees.js';
import groupRoutes from './routes/groups.js';
import activitiesRoutes from './routes/activities.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/mentors', mentorRoutes);
app.use('/api/mentees', menteeRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/activities', activitiesRoutes);

app.get('/', (req, res) => {
  res.send('🔥 Trà Đá Mentor API (mock data) đang chạy!');
});

app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));
