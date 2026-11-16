import { lazy } from 'react';
import { Link } from 'react-router-dom';
import {
  HiArrowUpRight,
  HiOutlineArrowRight,
  HiOutlineChatBubbleLeftRight,
  HiOutlineMap,
  HiOutlineSparkles,
} from 'react-icons/hi2';
import { AuthBootScreen } from '../components/AuthBootScreen';
import { AuthPageFooter } from '../components/AuthPageFooter';
import { ThemeToggle } from '../components/features/ThemeToggle';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useAuth } from '../hooks/useAuth';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { getProgramContent, OFFICIAL_APPLICATION_URL, OFFICIAL_SERVICES_URL } from '../content/officialProgram';
import './HomePage.css';

const DashboardPage = lazy(() => import('./DashboardPage'));

const copy = {
  vi: {
    navApproach: 'Cách mentoring', navPrograms: 'Chương trình', navCommunity: 'Cộng đồng',
    signIn: 'Đăng nhập', apply: 'Đăng ký mentee', eyebrow: 'HỆ SINH THÁI LIFE MENTORING',
    headline: 'Một cuộc trò chuyện. Một bước tiến mới.',
    lead: 'Gặp đúng người đồng hành, gọi tên điều bạn muốn thay đổi và biến mục tiêu thành một hành trình có thể đi được.',
    explore: 'Khám phá chương trình', note: 'Dành cho người trẻ muốn phát triển cùng sự đồng hành thật sự.',
    imageLabel: 'Không gian cho những cuộc trò chuyện có ý nghĩa',
    imageNote: 'Chậm lại một chút. Lắng nghe nhiều hơn. Tiến xa hơn cùng nhau.',
    approachEyebrow: 'BẮT ĐẦU TỪ ĐIỀU BẠN CẦN',
    approachTitle: 'Phát triển tốt hơn khi bạn không đi một mình.',
    approachLead: 'Một trải nghiệm mentoring rõ ràng, có định hướng và đủ gần gũi để bạn thật sự cất lời.',
    clarity: 'Đúng người đồng hành', clarityText: 'Kết nối với mentor phù hợp với mối quan tâm và hướng phát triển của bạn.',
    direction: 'Lộ trình có mục tiêu', directionText: 'Cùng thống nhất mục tiêu, kế hoạch và những bước tiếp theo có thể bắt đầu ngay.',
    progress: 'Tiến bộ nhìn thấy được', progressText: 'Theo dõi hành trình, nhìn lại điều đã học và điều chỉnh cùng mentor.',
    programsEyebrow: 'CHỌN HÀNH TRÌNH CỦA BẠN', programsTitle: 'Một khởi đầu phù hợp với mục tiêu.',
    programsLead: 'Tìm hiểu các hình thức mentoring và thông tin chính thức của từng chương trình.',
    learnMore: 'Xem chi tiết chương trình', processEyebrow: 'TỪ MONG MUỐN ĐẾN HÀNH ĐỘNG',
    processTitle: 'Bốn bước để bắt đầu.', processLead: 'Quy trình đăng ký và kết nối được thiết kế để bạn luôn biết điều gì sẽ diễn ra tiếp theo.',
    ctaEyebrow: 'BƯỚC TIẾP THEO CÓ THỂ BẮT ĐẦU HÔM NAY', ctaTitle: 'Sẵn sàng cho một cuộc trò chuyện mới?',
    ctaText: 'Khám phá chương trình phù hợp hoặc đăng nhập để tiếp tục hành trình mentoring của bạn.',
    footerNote: 'Một cộng đồng cùng học, cùng làm và cùng trưởng thành.',
    metricPrograms: 'Hình thức chương trình', metricDuration: 'Lộ trình 1:1 chuyên sâu',
    metricGroup: 'Tỷ lệ mentoring nhóm', metricAid: 'Suất hỗ trợ tài chính mỗi mùa',
  },
  en: {
    navApproach: 'Our approach', navPrograms: 'Programs', navCommunity: 'Community',
    signIn: 'Sign in', apply: 'Apply as a mentee', eyebrow: 'A LIFE MENTORING ECOSYSTEM',
    headline: 'One conversation. One step forward.',
    lead: 'Meet someone who gets where you want to go, name the change you want to make, and turn it into a journey you can take.',
    explore: 'Explore programs', note: 'For young people ready to grow with real support beside them.',
    imageLabel: 'Room for conversations that matter',
    imageNote: 'Slow down. Listen closer. Move forward together.',
    approachEyebrow: 'START WITH WHAT YOU NEED',
    approachTitle: 'Growth feels different when you do not go alone.',
    approachLead: 'A mentoring experience with direction, structure, and enough room to speak honestly.',
    clarity: 'The right person beside you', clarityText: 'Connect with a mentor aligned with your interests and direction.',
    direction: 'A roadmap with purpose', directionText: 'Set a goal, shape a plan, and choose the next steps you can take now.',
    progress: 'Progress you can see', progressText: 'Reflect on what you have learned and adjust the journey with your mentor.',
    programsEyebrow: 'CHOOSE YOUR JOURNEY', programsTitle: 'A starting point that fits your goals.',
    programsLead: 'Explore the mentoring formats and official information for each program.',
    learnMore: 'Explore all programs', processEyebrow: 'FROM INTENTION TO ACTION',
    processTitle: 'Four steps to get started.', processLead: 'A clear application and connection process means you know what happens next.',
    ctaEyebrow: 'YOUR NEXT STEP CAN START TODAY', ctaTitle: 'Ready for a new conversation?',
    ctaText: 'Find a program that fits or sign in to continue your mentoring journey.',
    footerNote: 'A community to learn, build, and grow together.',
    metricPrograms: 'Program formats', metricDuration: 'In-depth 1:1 journey',
    metricGroup: 'Group mentoring ratio', metricAid: 'Financial-aid awards per season',
  },
};

export default function HomePage() {
  const { state } = useAuth();
  const { i18n, t } = useAppTranslation();
  const language = i18n.language.startsWith('vi') ? 'vi' : 'en';
  const text = copy[language];
  const programs = getProgramContent(language);
  const groupRatio = programs.packages.find((program) => program.id === 'group-mentoring')?.format
    .split(':').map((part) => part.replace(/\D/g, '')).join(' : ') || '—';
  const aidAwards = programs.scholarships.reduce((total, item) => total + item.count, 0);

  if (state.isBootstrapping) return <AuthBootScreen />;
  if (state.isAuthenticated) return <DashboardPage />;

  return (
    <div className="public-home">
      <header className="home-nav">
        <Link className="home-brand" to="/" aria-label="Trà Đá Mentor — trang chủ">
          <img src="/logo.png" alt="" />
          <span>TRÀ ĐÁ <b>MENTOR</b></span>
        </Link>
        <nav className="home-nav__links" aria-label={language === 'vi' ? 'Điều hướng chính' : 'Main navigation'}>
          <a href="#approach">{text.navApproach}</a>
          <a href="#programs">{text.navPrograms}</a>
          <a href="#community">{text.navCommunity}</a>
        </nav>
        <div className="home-nav__actions">
          <ThemeToggle />
          <LanguageSwitcher compact placement="down" />
          <Link className="home-signin" to="/login">{text.signIn}</Link>
          <a className="home-apply" href={OFFICIAL_APPLICATION_URL} target="_blank" rel="noreferrer">
            {text.apply}<HiArrowUpRight aria-hidden />
          </a>
        </div>
      </header>

      <main>
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero__copy">
            <p className="home-eyebrow"><span />{text.eyebrow}</p>
            <h1 id="home-title">{text.headline}</h1>
            <p className="home-hero__lead">{text.lead}</p>
            <div className="home-hero__actions">
              <a className="home-apply home-apply--large" href={OFFICIAL_APPLICATION_URL} target="_blank" rel="noreferrer">
                {text.apply}<HiArrowUpRight aria-hidden />
              </a>
              <a className="home-text-link" href="#programs">{text.explore}<HiOutlineArrowRight aria-hidden /></a>
            </div>
            <p className="home-hero__note"><HiOutlineSparkles aria-hidden />{text.note}</p>
          </div>
          <figure className="home-hero__visual">
            <img src="/media/hero-session.jpg" alt={text.imageLabel} fetchPriority="high" />
            <figcaption className="home-hero__caption">
              <span className="home-caption-icon"><HiOutlineChatBubbleLeftRight aria-hidden /></span>
              <span><strong>{text.imageLabel}</strong><small>{text.imageNote}</small></span>
              <span className="home-caption-arrow" aria-hidden><HiArrowUpRight /></span>
            </figcaption>
            <span className="home-hero__index" aria-hidden>01 / GROW TOGETHER</span>
          </figure>
        </section>

        <section className="home-proof" aria-label={language === 'vi' ? 'Thông tin chương trình' : 'Program facts'}>
          {[
            { value: String(programs.packages.length), label: text.metricPrograms },
            { value: programs.packages[0]?.duration || '—', label: text.metricDuration },
            { value: groupRatio, label: text.metricGroup },
            { value: String(aidAwards), label: text.metricAid },
          ].map((metric) => (
            <div className="home-proof__metric" key={metric.label}>
              <strong>{metric.value}</strong><span>{metric.label}</span>
            </div>
          ))}
          <a className="home-proof__source" href={OFFICIAL_SERVICES_URL} target="_blank" rel="noreferrer">
            {programs.sourceLabel}<HiArrowUpRight aria-hidden />
          </a>
        </section>

        <section className="home-section home-approach" id="approach" aria-labelledby="approach-title">
          <div className="home-section__intro">
            <p className="home-eyebrow"><span />{text.approachEyebrow}</p>
            <h2 id="approach-title">{text.approachTitle}</h2>
            <p>{text.approachLead}</p>
          </div>
          <div className="home-benefits">
            {[
              { number: '01', title: text.clarity, body: text.clarityText, icon: <HiOutlineChatBubbleLeftRight aria-hidden /> },
              { number: '02', title: text.direction, body: text.directionText, icon: <HiOutlineMap aria-hidden /> },
              { number: '03', title: text.progress, body: text.progressText, icon: <HiOutlineSparkles aria-hidden /> },
            ].map((item) => (
              <article className="home-benefit" key={item.number}>
                <div className="home-benefit__top"><span>{item.number}</span><i>{item.icon}</i></div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section home-programs" id="programs" aria-labelledby="programs-title">
          <div className="home-section__heading">
            <div><p className="home-eyebrow"><span />{text.programsEyebrow}</p><h2 id="programs-title">{text.programsTitle}</h2></div>
            <p>{text.programsLead}</p>
          </div>
          <div className="home-program-grid">
            {programs.packages.map((program, index) => (
              <article className={`home-program${program.featured ? ' home-program--featured' : ''}`} key={program.id}>
                <div className="home-program__top"><span>0{index + 1}</span>{program.featured && <span className="home-program__badge">{programs.featured}</span>}</div>
                <h3>{program.name}</h3>
                <p>{program.description}</p>
                <div className="home-program__meta"><span>{program.duration}</span><strong>{program.price}</strong></div>
                <Link to="/programs" className="home-program__link">{text.learnMore}<HiOutlineArrowRight aria-hidden /></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section home-process" id="community" aria-labelledby="process-title">
          <div className="home-section__intro">
            <p className="home-eyebrow"><span />{text.processEyebrow}</p>
            <h2 id="process-title">{text.processTitle}</h2>
            <p>{text.processLead}</p>
          </div>
          <ol className="home-steps">
            {programs.process.map((step) => (
              <li key={step.label}><span>{step.label}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></li>
            ))}
          </ol>
        </section>

        <section className="home-cta">
          <div><p className="home-eyebrow"><span />{text.ctaEyebrow}</p><h2>{text.ctaTitle}</h2><p>{text.ctaText}</p></div>
          <a className="home-apply home-apply--large" href={OFFICIAL_APPLICATION_URL} target="_blank" rel="noreferrer">
            {text.apply}<HiArrowUpRight aria-hidden />
          </a>
        </section>
      </main>

      <footer className="home-footer">
        <Link className="home-brand" to="/" aria-label="Trà Đá Mentor — trang chủ">
          <img src="/logo.png" alt="" /><span>TRÀ ĐÁ <b>MENTOR</b></span>
        </Link>
        <p>{text.footerNote}</p>
        <AuthPageFooter />
        <a className="home-footer__source" href={OFFICIAL_SERVICES_URL} target="_blank" rel="noreferrer">{t('footer.privacy')} · tradamentor.com</a>
      </footer>
    </div>
  );
}
