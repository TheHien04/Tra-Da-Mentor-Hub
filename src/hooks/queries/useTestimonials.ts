import { useQuery } from '@tanstack/react-query';
import { testimonialsApi, type Testimonial } from '../../services/api';
import { unwrapList } from '../../lib/apiHelpers';
import { queryKeys } from './keys';

export function useTestimonials() {
  return useQuery({
    queryKey: queryKeys.testimonials,
    queryFn: async () => unwrapList<Testimonial>(await testimonialsApi.getAll()),
  });
}
