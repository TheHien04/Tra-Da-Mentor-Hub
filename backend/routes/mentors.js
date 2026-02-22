import express from 'express';
import { validateMentor } from '../middleware/validation.js';
const router = express.Router();

// 🧪 Mock data - Diverse roles from different departments
let mockMentors = [
  {
    _id: 'm1',
    name: 'Nguyễn Thị Ánh Dương',
    email: 'anhduong@example.com',
    phone: '0912345678',
    track: 'tech',
    bio: 'Senior Frontend Engineer with 6+ years of experience at leading tech companies. Passionate about mentoring and knowledge sharing.',
    expertise: ['ReactJS', 'Next.js', 'TailwindCSS', 'TypeScript'],
    maxMentees: 6,
    mentees: ['101', '201'],
    groups: ['201'],
    mentorshipType: 'GROUP',
    duration: 'LONG_TERM',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'm2',
    name: 'Phạm Minh Nhật',
    email: 'nhatpm@example.com',
    phone: '0988765432',
    track: 'tech',
    bio: 'Backend Developer specializing in Node.js and MongoDB. Implemented multiple large-scale systems with high performance requirements.',
    expertise: ['Node.js', 'MongoDB', 'REST API', 'Docker'],
    maxMentees: 5,
    mentees: ['102'],
    groups: ['202'],
    mentorshipType: 'GROUP',
    duration: 'LONG_TERM',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'm3',
    name: 'Trần Quang Huy',
    email: 'huytran@example.com',
    phone: '0933222111',
    track: 'design',
    bio: 'UI/UX Designer with 7+ years of experience. Designed digital products for startups from seed funding to Series A.',
    expertise: ['Figma', 'UX Research', 'Design System', 'Prototyping'],
    maxMentees: 4,
    mentees: [],
    groups: [],
    mentorshipType: 'ONE_ON_ONE',
    duration: 'SHORT_TERM',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'm4',
    name: 'Lê Văn Kiên',
    email: 'kien.le@example.com',
    phone: '0917654321',
    track: 'business',
    bio: 'Product Manager at fintech startup. Helped scale product from 0 to 100k users. Expert in building data-driven product roadmaps.',
    expertise: ['Product Management', 'Agile', 'User Research', 'Analytics'],
    maxMentees: 5,
    mentees: ['202'],
    groups: ['203'],
    mentorshipType: 'GROUP',
    duration: 'LONG_TERM',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'm5',
    name: 'Hoàng Như Quỳnh',
    email: 'quynh.hoang@example.com',
    phone: '0934567891',
    track: 'marketing',
    bio: 'Marketing Director with expertise in B2B and B2C strategies. Grew company revenue by 300% through targeted campaigns.',
    expertise: ['Marketing Strategy', 'Growth Hacking', 'Brand Building', 'SEO'],
    maxMentees: 6,
    mentees: [],
    groups: [],
    mentorshipType: 'ONE_ON_ONE',
    duration: 'SHORT_TERM',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'm6',
    name: 'Vũ Đức Thắng',
    email: 'thang.vu@example.com',
    phone: '0945678923',
    track: 'tech',
    bio: 'Data Scientist and ML Engineer. Built predictive models for e-commerce optimization. Published research in AI conferences.',
    expertise: ['Data Science', 'Machine Learning', 'Python', 'TensorFlow'],
    maxMentees: 4,
    mentees: [],
    groups: [],
    mentorshipType: 'GROUP',
    duration: 'LONG_TERM',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'm7',
    name: 'Trương Thảo Vy',
    email: 'thaoVy.truong@example.com',
    phone: '0956789012',
    track: 'hr',
    bio: 'HR Director at tech company. Specializes in building high-performing teams and creating inclusive workplace culture.',
    expertise: ['HR Strategy', 'Team Building', 'Talent Development', 'Recruitment'],
    maxMentees: 5,
    mentees: [],
    groups: [],
    mentorshipType: 'ONE_ON_ONE',
    duration: 'LONG_TERM',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'm8',
    name: 'Đặng Quốc Huy',
    email: 'huy.dang@example.com',
    phone: '0967890123',
    track: 'startup',
    bio: 'Startup Founder and Advisor. Helped 15+ startups raise Series A funding. Expert in business model innovation.',
    expertise: ['Business Strategy', 'Fundraising', 'Startup', 'Venture Capital'],
    maxMentees: 3,
    mentees: [],
    groups: [],
    mentorshipType: 'ONE_ON_ONE',
    duration: 'SHORT_TERM',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'm9',
    name: 'Ngô Văn Linh',
    email: 'linhngo@example.com',
    phone: '0911678901',
    track: 'economics',
    bio: 'Economist specializing in microeconomics and market analysis. Consulted for 20+ companies on financial strategy.',
    expertise: ['Microeconomics', 'Market Analysis', 'Financial Strategy', 'Data Modeling'],
    maxMentees: 4,
    mentees: [],
    groups: [],
    mentorshipType: 'ONE_ON_ONE',
    duration: 'LONG_TERM',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'm10',
    name: 'Trần Đức Huy',
    email: 'duchain@example.com',
    phone: '0922789012',
    track: 'sales',
    bio: 'Enterprise Sales Director with 8+ years experience. Built and scaled sales teams from 0 to 50+ members.',
    expertise: ['B2B Sales', 'Sales Strategy', 'Team Building', 'Account Management'],
    maxMentees: 4,
    mentees: [],
    groups: [],
    mentorshipType: 'GROUP',
    duration: 'MEDIUM_TERM',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'm11',
    name: 'Bùi Thị Lan Anh',
    email: 'lananhbui@example.com',
    phone: '0933890123',
    track: 'education',
    bio: 'Education Program Director with 10+ years in curriculum development and student mentoring.',
    expertise: ['Curriculum Design', 'Teaching Methods', 'Student Development', 'Program Management'],
    maxMentees: 6,
    mentees: [],
    groups: [],
    mentorshipType: 'GROUP',
    duration: 'LONG_TERM',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'm12',
    name: 'Võ Hoàng Nam',
    email: 'namvo@example.com',
    phone: '0944901234',
    track: 'social',
    bio: 'Social Sciences Researcher focused on education and community development. Led programs impacting 10,000+ students.',
    expertise: ['Social Research', 'Education Policy', 'Community Development', 'Statistics'],
    maxMentees: 5,
    mentees: [],
    groups: [],
    mentorshipType: 'GROUP',
    duration: 'LONG_TERM',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// 📥 Lấy tất cả mentors
router.get('/', (req, res) => {
  res.json(mockMentors);
});

// ➕ Thêm mới mentor
router.post('/', validateMentor, (req, res) => {
  const newMentor = {
    _id: `m${Date.now()}`,
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
    mentees: [],
    groups: []
  };
  mockMentors.push(newMentor);
  res.status(201).json(newMentor);
});

// 🔍 Xem mentor theo ID
router.get('/:id', (req, res) => {
  const mentor = mockMentors.find(m => m._id === req.params.id);
  if (!mentor) return res.status(404).json({ message: 'Mentor không tồn tại' });
  res.json(mentor);
});

// ✏️ Cập nhật mentor (full update)
router.put('/:id', validateMentor, (req, res) => {
  const mentor = mockMentors.find(m => m._id === req.params.id);
  if (!mentor) return res.status(404).json({ message: 'Mentor không tồn tại' });
  
  const updatedMentor = {
    ...mentor,
    ...req.body,
    _id: mentor._id,
    createdAt: mentor.createdAt,
    updatedAt: new Date()
  };
  
  const index = mockMentors.findIndex(m => m._id === req.params.id);
  mockMentors[index] = updatedMentor;
  res.json(updatedMentor);
});

// 🔧 Cập nhật mentor (partial update)
router.patch('/:id', validateMentor, (req, res) => {
  const mentor = mockMentors.find(m => m._id === req.params.id);
  if (!mentor) return res.status(404).json({ message: 'Mentor không tồn tại' });
  
  const updatedMentor = {
    ...mentor,
    ...req.body,
    _id: mentor._id,
    createdAt: mentor.createdAt,
    updatedAt: new Date()
  };
  
  const index = mockMentors.findIndex(m => m._id === req.params.id);
  mockMentors[index] = updatedMentor;
  res.json(updatedMentor);
});

// ❌ Xóa mentor
router.delete('/:id', (req, res) => {
  const index = mockMentors.findIndex(m => m._id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Mentor không tồn tại' });
  mockMentors.splice(index, 1);
  res.json({ message: 'Đã xóa mentor' });
});

export default router;