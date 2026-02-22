import express from 'express';
const router = express.Router();

// 🔹 Mock activities data
let mockActivities = [
  {
    _id: 'act1',
    type: 'mentor_created_group',
    actor: { id: 'm1', name: 'Nguyễn Thị Ánh Dương', avatar: '👩‍🏫' },
    action: 'created group',
    target: 'Frontend Avengers',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    description: 'Mentor Nguyễn Thị Ánh Dương created group Frontend Avengers'
  },
  {
    _id: 'act2',
    type: 'mentee_joined_group',
    actor: { id: '101', name: 'Nguyễn Văn M', avatar: '👨‍🎓' },
    action: 'joined group',
    target: 'Frontend Avengers',
    timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), // 1.5 days ago
    description: 'Mentee Nguyễn Văn M joined Frontend Avengers'
  },
  {
    _id: 'act3',
    type: 'mentee_progress_updated',
    actor: { id: '102', name: 'Trần Thị N', avatar: '👩‍🎓' },
    action: 'completed program',
    target: 'Backend Busters',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    description: 'Mentee Trần Thị N completed program in Backend Busters (100%)'
  },
  {
    _id: 'act4',
    type: 'mentor_assigned',
    actor: { id: 'm2', name: 'Phạm Minh Nhật', avatar: '👨‍🏫' },
    action: 'assigned mentee',
    target: 'Trần Thị N',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    description: 'Mentor Phạm Minh Nhật assigned mentee Trần Thị N'
  },
  {
    _id: 'act5',
    type: 'group_meeting_scheduled',
    actor: { id: 'm1', name: 'Nguyễn Thị Ánh Dương', avatar: '👩‍🏫' },
    action: 'scheduled meeting',
    target: 'Frontend Avengers',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    description: 'Meeting scheduled for Frontend Avengers - Monday 7:00 PM'
  },
  {
    _id: 'act6',
    type: 'mentor_created',
    actor: { id: 'm3', name: 'Trần Quang Huy', avatar: '👨‍🏫' },
    action: 'joined as mentor',
    target: 'Mentor Program',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    description: 'Mentor Trần Quang Huy joined the program'
  },
  {
    _id: 'act7',
    type: 'mentee_created',
    actor: { id: '101', name: 'Nguyễn Văn M', avatar: '👨‍🎓' },
    action: 'joined as mentee',
    target: 'Mentee Program',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
    description: 'Mentee Nguyễn Văn M joined the program'
  }
];

// GET all activities
router.get('/', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 50;
  const sorted = [...mockActivities].sort((a, b) => b.timestamp - a.timestamp);
  res.json(sorted.slice(0, limit));
});

// POST new activity (for future logging)
router.post('/', (req, res) => {
  const newActivity = {
    _id: Date.now().toString(),
    ...req.body,
    timestamp: new Date()
  };
  mockActivities.unshift(newActivity);
  res.status(201).json(newActivity);
});

// GET activity by ID
router.get('/:id', (req, res) => {
  const activity = mockActivities.find(a => a._id === req.params.id);
  if (!activity) return res.status(404).json({ message: 'Không tìm thấy activity' });
  res.json(activity);
});

// PUT - Update activity
router.put('/:id', (req, res) => {
  const activity = mockActivities.find(a => a._id === req.params.id);
  if (!activity) return res.status(404).json({ message: 'Không tìm thấy activity' });
  
  const index = mockActivities.findIndex(a => a._id === req.params.id);
  mockActivities[index] = {
    ...activity,
    ...req.body,
    _id: activity._id,
    timestamp: activity.timestamp
  };
  res.json(mockActivities[index]);
});

// PATCH - Partial update activity
router.patch('/:id', (req, res) => {
  const activity = mockActivities.find(a => a._id === req.params.id);
  if (!activity) return res.status(404).json({ message: 'Không tìm thấy activity' });
  
  const index = mockActivities.findIndex(a => a._id === req.params.id);
  mockActivities[index] = {
    ...activity,
    ...req.body,
    _id: activity._id,
    timestamp: activity.timestamp
  };
  res.json(mockActivities[index]);
});

// DELETE activity
router.delete('/:id', (req, res) => {
  const index = mockActivities.findIndex(a => a._id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy activity' });
  mockActivities.splice(index, 1);
  res.json({ message: 'Đã xóa activity' });
});

export default router;
