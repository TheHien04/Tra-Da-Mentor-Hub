const LABELS = {
  tech: 'Technology',
  economics: 'Economics',
  marketing: 'Marketing',
  hr: 'Human Resources',
  sales: 'Sales',
  social: 'Social Studies',
  business: 'Business',
  education: 'Education',
  startup: 'Startup',
  design: 'Design',
};

export function trackLabel(track) {
  return LABELS[track] || LABELS.tech;
}
