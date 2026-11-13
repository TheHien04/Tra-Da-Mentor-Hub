export const OFFICIAL_SITE_URL = 'https://www.tradamentor.com';
export const OFFICIAL_SERVICES_URL = 'https://www.tradamentor.com/dich-vu';
export const OFFICIAL_APPLICATION_URL = 'https://forms.gle/WNNDMoiHvf7oMGPq7';

export type ProgramLocale = 'vi' | 'en';

export type ServicePackage = {
  id: 'mentoring-8-week' | 'mentoring-4-week' | 'group-mentoring' | 'mentee-community';
  name: string;
  price: string;
  duration: string;
  format: string;
  description: string;
  features: string[];
  featured?: boolean;
};

type ProgramContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  sourceLabel: string;
  programsHeading: string;
  programsDescription: string;
  perPerson: string;
  apply: string;
  featured: string;
  processHeading: string;
  processDescription: string;
  process: { label: string; title: string; description: string }[];
  journeyHeading: string;
  journeyDescription: string;
  journey: { week: string; title: string }[];
  scholarshipsHeading: string;
  scholarshipsDescription: string;
  scholarshipUnit: string;
  scholarships: { count: number; discount: string }[];
  contactHeading: string;
  contactDescription: string;
  back: string;
  packages: ServicePackage[];
};

const sharedOneToOneFeaturesVi = [
  'Kế hoạch mentoring được cá nhân hóa',
  'Có chương trình hỗ trợ tài chính',
  'Theo dõi tiến độ trong suốt chương trình',
  'Giấy chứng nhận hoàn thành có mộc đỏ',
];

const sharedOneToOneFeaturesEn = [
  'Personalized mentoring plan',
  'Financial-aid options',
  'Progress tracking throughout the program',
  'Stamped completion certificate',
];

export const programContent: Record<ProgramLocale, ProgramContent> = {
  vi: {
    eyebrow: 'Hệ sinh thái Life Mentoring',
    title: 'Dẫn lối tương lai, phát triển tiềm năng không giới hạn',
    subtitle:
      'Kết nối mentee với mentor phù hợp, xây dựng lộ trình phát triển cá nhân hóa và theo dõi chất lượng mentoring xuyên suốt.',
    sourceLabel: 'Xem thông tin gốc tại Trà Đá Mentor',
    programsHeading: 'Các hình thức mentoring',
    programsDescription: 'Mức phí được công bố trên website chính thức của Trà Đá Mentor.',
    perPerson: '/người',
    apply: 'Đăng ký làm mentee',
    featured: '8 tuần chuyên sâu',
    processHeading: 'Quy trình đăng ký mentee',
    processDescription: 'Bốn bước từ hồ sơ ban đầu đến ngày bắt đầu chương trình.',
    process: [
      { label: '01', title: 'Điền đơn apply', description: 'Giới thiệu bản thân và vấn đề bạn muốn được mentoring.' },
      { label: '02', title: 'Phỏng vấn cùng mentor', description: 'Mentor phù hợp sẽ chọn hồ sơ và trao đổi trực tiếp với bạn.' },
      { label: '03', title: 'Nhận kết quả', description: 'Nhận kết quả ghép cặp và thông tin hỗ trợ tài chính.' },
      { label: '04', title: 'Mentee Onboarding', description: 'Gặp cộng đồng mentee và được giới thiệu đầy đủ về chương trình.' },
    ],
    journeyHeading: 'Hành trình mentoring 8 tuần',
    journeyDescription: 'Các cột mốc chất lượng chính được Trà Đá Mentor công bố.',
    journey: [
      { week: 'Tuần 1', title: 'Mentor và mentee làm quen, tìm hiểu' },
      { week: 'Tuần 2', title: 'Thống nhất và hoàn thành kế hoạch mentoring' },
      { week: 'Tuần 4', title: 'Buddy theo dõi, hỗ trợ cả mentor và mentee' },
      { week: 'Tuần 8', title: 'Mentor xây dựng kế hoạch phát triển dài hạn' },
      { week: 'Tuần 9', title: 'Hai bên hoàn tất đánh giá cuối chương trình' },
    ],
    scholarshipsHeading: 'Hỗ trợ tài chính',
    scholarshipsDescription: 'Số suất hỗ trợ được công bố cho mỗi mùa tuyển sinh.',
    scholarshipUnit: 'suất học bổng',
    scholarships: [
      { count: 3, discount: '100%' },
      { count: 5, discount: '75%' },
      { count: 5, discount: '50%' },
      { count: 7, discount: '25%' },
    ],
    contactHeading: 'Liên hệ Trà Đá Mentor',
    contactDescription: 'Thông tin liên hệ được công bố trên website chính thức.',
    back: 'Quay lại đăng nhập',
    packages: [
      {
        id: 'mentoring-8-week', name: 'Mentoring 8 tuần', price: '1.299.000₫', duration: '8 tuần',
        format: '1 mentor : 1 mentee', description: 'Lộ trình chuyên sâu dành cho mục tiêu phát triển dài hạn.',
        features: sharedOneToOneFeaturesVi, featured: true,
      },
      {
        id: 'mentoring-4-week', name: 'Mentoring 4 tuần', price: '899.000₫', duration: '4 tuần',
        format: '1 mentor : 1 mentee', description: 'Lộ trình cô đọng để tháo gỡ một mục tiêu trọng tâm.',
        features: sharedOneToOneFeaturesVi,
      },
      {
        id: 'group-mentoring', name: 'Mentoring theo nhóm', price: '399.000₫',
        duration: '3 buổi · 1 giờ 30 phút/buổi', format: '1 mentor : 2 mentees',
        description: 'Học cùng một bạn đồng hành trong nhóm nhỏ, có mentor hướng dẫn.',
        features: ['Tương tác nhóm nhỏ', 'Giấy chứng nhận hoàn thành có mộc đỏ'],
      },
      {
        id: 'mentee-community', name: 'Mentee Community', price: '499.000₫',
        duration: 'Quyền tham gia vĩnh viễn', format: 'Nhóm 5 mentees',
        description: 'Làm dự án, kết nối và học hỏi trong cộng đồng mentee.',
        features: ['4 masterclass bởi chuyên gia', 'Bài tập và dự án nhóm', 'Giấy chứng nhận sau khi hoàn thành'],
      },
    ],
  },
  en: {
    eyebrow: 'Vietnam’s Life Mentoring ecosystem',
    title: 'Guiding your future and unlocking your potential',
    subtitle:
      'Connect with a suitable mentor, follow a personalized growth roadmap, and receive quality support throughout the mentoring journey.',
    sourceLabel: 'View the official Trà Đá Mentor page',
    programsHeading: 'Mentoring programs',
    programsDescription: 'Fees published on the official Trà Đá Mentor website.',
    perPerson: '/person',
    apply: 'Apply as a mentee',
    featured: 'In-depth 8 weeks',
    processHeading: 'Mentee application process',
    processDescription: 'Four steps from your initial application to program onboarding.',
    process: [
      { label: '01', title: 'Submit an application', description: 'Introduce yourself and the challenge you want mentoring support with.' },
      { label: '02', title: 'Interview with a mentor', description: 'A suitable mentor selects your application for a direct conversation.' },
      { label: '03', title: 'Receive the result', description: 'Receive your matching result and financial-aid information.' },
      { label: '04', title: 'Mentee onboarding', description: 'Meet the mentee community and learn how the program works.' },
    ],
    journeyHeading: 'The 8-week mentoring journey',
    journeyDescription: 'Key quality milestones published by Trà Đá Mentor.',
    journey: [
      { week: 'Week 1', title: 'Mentor and mentee get to know each other' },
      { week: 'Week 2', title: 'Agree on and complete the mentoring plan' },
      { week: 'Week 4', title: 'A buddy checks in with both participants' },
      { week: 'Week 8', title: 'The mentor prepares a long-term growth plan' },
      { week: 'Week 9', title: 'Both participants complete the final review' },
    ],
    scholarshipsHeading: 'Financial aid',
    scholarshipsDescription: 'Published allocation for each application season.',
    scholarshipUnit: 'scholarships at',
    scholarships: [
      { count: 3, discount: '100%' }, { count: 5, discount: '75%' },
      { count: 5, discount: '50%' }, { count: 7, discount: '25%' },
    ],
    contactHeading: 'Contact Trà Đá Mentor',
    contactDescription: 'Contact details published on the official website.',
    back: 'Back to sign in',
    packages: [
      {
        id: 'mentoring-8-week', name: '8-week mentoring', price: 'VND 1,299,000', duration: '8 weeks',
        format: '1 mentor : 1 mentee', description: 'An in-depth journey for long-term development goals.',
        features: sharedOneToOneFeaturesEn, featured: true,
      },
      {
        id: 'mentoring-4-week', name: '4-week mentoring', price: 'VND 899,000', duration: '4 weeks',
        format: '1 mentor : 1 mentee', description: 'A focused journey for one important development goal.',
        features: sharedOneToOneFeaturesEn,
      },
      {
        id: 'group-mentoring', name: 'Group mentoring', price: 'VND 399,000',
        duration: '3 sessions · 90 minutes each', format: '1 mentor : 2 mentees',
        description: 'Learn with a peer in a small group guided by a mentor.',
        features: ['Small-group interaction', 'Stamped completion certificate'],
      },
      {
        id: 'mentee-community', name: 'Mentee Community', price: 'VND 499,000',
        duration: 'Lifetime access', format: 'Groups of 5 mentees',
        description: 'Build projects, connect, and learn with the mentee community.',
        features: ['4 expert masterclasses', 'Team assignments and projects', 'Certificate upon completion'],
      },
    ],
  },
};

export function getProgramContent(language: string): ProgramContent {
  return programContent[language.startsWith('vi') ? 'vi' : 'en'];
}
