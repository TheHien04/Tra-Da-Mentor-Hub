import { useAppTranslation } from '../hooks/useAppTranslation';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { PageShell, PageHeader } from '../components/ui';
import { SmartMatchPanel } from '../components/features/SmartMatchPanel';

const InsightsPage = () => {
  const { t } = useAppTranslation();

  return (
    <PageShell>
      <PageHeader
        title={t('pages.insights.title')}
        description={t('pages.insights.description')}
        icon={<HiOutlineSparkles className="h-7 w-7" />}
        badge="beta"
      />
      <SmartMatchPanel />
    </PageShell>
  );
};

export default InsightsPage;
