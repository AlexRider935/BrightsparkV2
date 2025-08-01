import AchievementsSection from '@/components/AchievementsSection';
import CTASection from '@/components/CTASection';
import FeaturesSection from '@/components/FeaturesSection';
// Remove Footer import from here
import HeroSection from '@/components/HeroSection';
import TestimonialsSection from '@/components/Testimonials';

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