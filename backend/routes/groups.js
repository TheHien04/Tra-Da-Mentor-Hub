import express from 'express';
const router = express.Router();

// 🔹 Mock data - Study groups
let mockGroups = [
  {
    _id: '201',
    name: 'Frontend Avengers',
    description: 'Learn React, Next.js and modern frontend development practices. Focus on building scalable UI components and state management.',
    topic: 'React + TypeScript',
    mentorId: 'm1',
    mentor: {
      name: 'Nguyễn Thị Ánh Dương'
    },
    mentees: ['101', '103'],
    maxSize: 5,
    meetingSchedule: {
      frequency: 'Weekly',
      dayOfWeek: 'Monday',
      time: '19:00'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '202',
    name: 'Backend Builders',
    description: 'Master Node.js, Express and database design. Build RESTful APIs and microservices architecture.',
    topic: 'Node.js & Databases',
    mentorId: 'm2',
    mentor: {
      name: 'Phạm Minh Nhật'
    },
    mentees: ['102', '107'],
    maxSize: 4,
    meetingSchedule: {
      frequency: 'Weekly',
      dayOfWeek: 'Wednesday',
      time: '19:30'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '203',
    name: 'Product & Strategy Circle',
    description: 'Discuss product management strategies, user research, and building successful products. Learn from real-world case studies.',
    topic: 'Product Management',
    mentorId: 'm4',
    mentor: {
      name: 'Lê Văn Kiên'
    },
    mentees: ['106'],
    maxSize: 6,
    meetingSchedule: {
      frequency: 'Bi-weekly',
      dayOfWeek: 'Thursday',
      time: '18:00'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '204',
    name: 'Design Thinkers',
    description: 'Explore UX/UI principles, design systems, and user research methods. Create portfolio-worthy projects.',
    topic: 'UI/UX Design',
    mentorId: 'm3',
    mentor: {
      name: 'Trần Quang Huy'
    },
    mentees: [],
    maxSize: 5,
    meetingSchedule: {
      frequency: 'Weekly',
      dayOfWeek: 'Tuesday',
      time: '18:30'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// GET all groups
router.get('/', (req, res) => {
  res.json(mockGroups);
});

// POST create group
router.post('/', (req, res) => {
  const newGroup = {
    _id: Date.now().toString(),
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockGroups.push(newGroup);
  res.status(201).json(newGroup);
});

// GET group by ID
router.get('/:id', (req, res) => {
  const group = mockGroups.find(g => g._id === req.params.id);
  if (!group) return res.status(404).json({ message: 'Không tìm thấy group' });
  res.json(group);
});

// GET group by ID with full details (mentees info)
router.get('/:id/full', (req, res) => {
  const group = mockGroups.find(g => g._id === req.params.id);
  if (!group) return res.status(404).json({ message: 'Không tìm thấy group' });
  res.json(group);
});

// DELETE group
router.delete('/:id', (req, res) => {
  const index = mockGroups.findIndex(g => g._id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy group' });
  mockGroups.splice(index, 1);
  res.json({ message: 'Đã xóa group' });
});

export default router;
