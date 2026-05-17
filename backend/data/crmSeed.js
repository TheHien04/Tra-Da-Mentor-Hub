// CRM seed data (matches legacy mock API shape)
export const MENTOR_SEED = [
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
];;

export const MENTEE_SEED = [
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
    applicationStatus: 'pending',
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
    applicationStatus: 'pending',
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
];;

export const GROUP_SEED = [
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
];;


export const ACTIVITY_SEED = [
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
];;
