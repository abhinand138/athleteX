import Navbar from "../components/layout/Navbar";
import Hero from "../components/home/Hero";
import Statistics from "../components/home/Statistics";
import RisingStars from "../components/home/RisingStars";
import PathToPro from "../components/home/PathToPro";
import AnalyticsFeatures from "../components/home/AnalyticsFeatures";
import CtaArena from "../components/home/CtaArena";
import Footer from "../components/layout/Footer";

export default function Landing() {
  return (
    <div className="bg-brand-dark min-h-screen text-gray-100 selection:bg-brand-peach/30 selection:text-white">
      <Navbar />
      <Hero />
      <Statistics />
      <RisingStars />
      <PathToPro />
      <AnalyticsFeatures />
      <CtaArena />
      <Footer />
    </div>
  );
}