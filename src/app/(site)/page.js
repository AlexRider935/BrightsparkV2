import AchievementsSection from '@/app/(site)/components/AchievementsSection';
import CTASection from '@/app/(site)/components/CTASection';
import FeaturesSection from '@/app/(site)/components/FeaturesSection';
// Remove Footer import from here
import HeroSection from '@/app/(site)/components/HeroSection';
import TestimonialsSection from '@/app/(site)/components/Testimonials';

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <AchievementsSection />
      <CTASection />
      {/* Footer is no longer needed here */}
    </>
  );
}