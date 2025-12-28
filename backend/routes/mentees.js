import express from 'express';
const router = express.Router();

// 🔹 Mock data - Vietnamese students from universities, international universities, and high schools
let mockMentees = [
  // VIETNAM - Year 1 & 2 Students
  {
    _id: '101',
    name: 'Hoàng Minh Đức',
    email: 'minh.hoang@hust.edu.vn',
    phone: '0912345001',
    track: 'tech',
    school: 'Hanoi University of Science and Technology (HUST) - Year 1',
    interests: ['React', 'Frontend', 'Web Design'],
    progress: 25,
    mentorId: 'm1',
    groupId: '201',
    mentorshipType: 'GROUP',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '102',
    name: 'Trần Thị Nhi',
    email: 'thi.nhi@hue.edu.vn',
    phone: '0912345002',
    track: 'tech',
    school: 'University of Sciences, Hue - Year 2',
    interests: ['Node.js', 'Backend', 'Database Design'],
    progress: 45,
    mentorId: 'm2',
    groupId: '202',
    mentorshipType: 'GROUP',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '104',
    name: 'Lê Thị Hương',
    email: 'huong.le@uef.edu.vn',
    phone: '0912345004',
    track: 'economics',
    school: 'University of Economics - HCMC - Year 1',
    interests: ['Data Analysis', 'Business Analytics', 'Python'],
    progress: 30,
    mentorId: 'm9',
    groupId: null,
    mentorshipType: 'ONE_ON_ONE',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '107',
    name: 'Đỗ Minh Khôi',
    email: 'minh.khoi@apcs.hcmus.edu.vn',
    phone: '0912345007',
    track: 'tech',
    school: 'Ho Chi Minh City University of Science - APCS - Year 1',
    interests: ['Web Development', 'JavaScript', 'HTML/CSS'],
    progress: 28,
    mentorId: 'm2',
    groupId: '202',
    mentorshipType: 'GROUP',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '111',
    name: 'Phạm Quang Huy',
    email: 'quang.huy@fpt.edu.vn',
    phone: '0912345011',
    track: 'design',
    school: 'FPT University - Year 2',
    interests: ['Mobile App Development', 'Flutter', 'UI/UX'],
    progress: 38,
    mentorId: 'm3',
    groupId: '201',
    mentorshipType: 'GROUP',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '112',
    name: 'Nguyễn Thúy Vy',
    email: 'thuy.vy@tnu.edu.vn',
    phone: '0912345012',
    track: 'marketing',
    school: 'Thai Nguyen University - Year 1',
    interests: ['Java Programming', 'OOP', 'Spring Boot Basics'],
    progress: 22,
    mentorId: 'm5',
    groupId: null,
    mentorshipType: 'ONE_ON_ONE',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // INTERNATIONAL - Year 1 & 2 Students (Mid-tier Universities)
  {
    _id: '105',
    name: 'Phạm Đức Thắng',
    email: 'duc.thang.2024@up.edu.ph',
    phone: '0912345005',
    track: 'tech',
    school: 'University of the Philippines - Year 1',
    interests: ['Python', 'Data Structures', 'Problem Solving'],
    progress: 32,
    mentorId: 'm6',
    groupId: '203',
    mentorshipType: 'GROUP',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '106',
    name: 'Vũ Thanh Hà',
    email: 'thanh.ha.2023@ui.ac.id',
    phone: '0912345006',
    track: 'business',
    school: 'University of Indonesia - Year 2',
    interests: ['Web Development', 'JavaScript', 'MySQL'],
    progress: 40,
    mentorId: 'm4',
    groupId: '203',
    mentorshipType: 'GROUP',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '108',
    name: 'Trần Quỳnh Như',
    email: 'quynh.nhu.2024@um.edu.my',
    phone: '0912345008',
    track: 'design',
    school: 'University of Malaya - Year 1',
    interests: ['UI/UX Design', 'Web Design', 'Figma'],
    progress: 26,
    mentorId: 'm3',
    groupId: null,
    mentorshipType: 'ONE_ON_ONE',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '110',
    name: 'Bùi Đức Mạnh',
    email: 'duc.manh@rmit.edu.vn',
    phone: '0912345010',
    track: 'tech',
    school: 'RMIT University Vietnam - Year 2',
    interests: ['Software Engineering', 'Agile', 'Team Collaboration'],
    progress: 35,
    mentorId: 'm2',
    groupId: null,
    mentorshipType: 'ONE_ON_ONE',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '113',
    name: 'Trần Lan Anh',
    email: 'lan.anh.2024@dlsu.edu.ph',
    phone: '0912345013',
    track: 'sales',
    school: 'De La Salle University - Year 1',
    interests: ['Web Development', 'HTML/CSS', 'JavaScript'],
    progress: 24,
    mentorId: 'm10',
    groupId: '201',
    mentorshipType: 'GROUP',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '114',
    name: 'Lý Khánh Nam',
    email: 'khanh.nam.2023@binus.ac.id',
    phone: '0912345014',
    track: 'hr',
    school: 'Bina Nusantara University - Year 2',
    interests: ['Backend Development', 'Node.js', 'Express.js'],
    progress: 42,
    mentorId: 'm7',
    groupId: '202',
    mentorshipType: 'GROUP',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '115',
    name: 'Nguyễn Văn Sơn',
    email: 'vansont@student.hust.edu.vn',
    phone: '0912345015',
    track: 'startup',
    school: 'Hanoi University of Science and Technology - Year 2',
    interests: ['Entrepreneurship', 'Business Model', 'Fundraising'],
    progress: 35,
    mentorId: 'm8',
    groupId: null,
    mentorshipType: 'ONE_ON_ONE',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '116',
    name: 'Phan Thị Mai',
    email: 'thaimaip@student.edu.vn',
    phone: '0912345016',
    track: 'education',
    school: 'Pedagogical University - Year 1',
    interests: ['Teaching Methods', 'Educational Technology', 'Student Development'],
    progress: 28,
    mentorId: 'm11',
    groupId: '201',
    mentorshipType: 'GROUP',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '117',
    name: 'Lê Quốc Hải',
    email: 'quochail@student.hcmus.edu.vn',
    phone: '0912345017',
    track: 'social',
    school: 'University of Social Sciences and Humanities - Year 2',
    interests: ['Social Research', 'Community Development', 'Policy Analysis'],
    progress: 31,
    mentorId: 'm12',
    groupId: '202',
    mentorshipType: 'GROUP',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '118',
    name: 'Trương Minh Hiệu',
    email: 'minhhieuu@student.fpt.edu.vn',
    phone: '0912345018',
    track: 'tech',
    school: 'FPT University - Year 1',
    interests: ['Mobile Development', 'Swift', 'iOS Development'],
    progress: 20,
    mentorId: 'm1',
    groupId: '201',
    mentorshipType: 'GROUP',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '119',
    name: 'Võ Thị Thanh Tâm',
    email: 'thanhtamm@student.ufm.edu.vn',
    phone: '0912345019',
    track: 'business',
    school: 'University of Finance and Marketing - Year 1',
    interests: ['Business Analysis', 'Strategic Planning', 'Market Research'],
    progress: 27,
    mentorId: 'm4',
    groupId: null,
    mentorshipType: 'ONE_ON_ONE',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '120',
    name: 'Đặng Thanh Tùng',
    email: 'thanhtungg@student.vnu.edu.vn',
    phone: '0912345020',
    track: 'economics',
    school: 'Vietnam National University - Year 2',
    interests: ['Economic Analysis', 'Financial Modeling', 'Market Trends'],
    progress: 44,
    mentorId: 'm9',
    groupId: '203',
    mentorshipType: 'GROUP',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// GET all mentees
router.get('/', (req, res) => {
  res.json(mockMentees);
});

// POST create mentee
router.post('/', (req, res) => {
  const newMentee = {
    _id: Date.now().toString(),
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockMentees.push(newMentee);
  res.status(201).json(newMentee);
});

// GET mentee by ID
router.get('/:id', (req, res) => {
  const mentee = mockMentees.find(m => m._id === req.params.id);
  if (!mentee) return res.status(404).json({ message: 'Không tìm thấy mentee' });
  res.json(mentee);
});

// DELETE mentee
router.delete('/:id', (req, res) => {
  const index = mockMentees.findIndex(m => m._id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy mentee' });
  mockMentees.splice(index, 1);
  res.json({ message: 'Đã xóa mentee' });
});

export default router;
