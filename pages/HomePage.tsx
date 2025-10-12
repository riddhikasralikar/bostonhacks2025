
import React from 'react';
import { Link } from 'react-router-dom';

const ArrowDownIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
  </svg>
);

const FeatureCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border border-black p-8 h-full flex flex-col">
    <h3 className="text-2xl font-semibold mb-4 tracking-wide">{title}</h3>
    <p className="text-gray-700">{children}</p>
  </div>
);

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-6">
      {/* Hero Section */}
      <section className="text-center h-[calc(100vh-81px)] flex flex-col justify-center items-center">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4">
          Predict Tomorrow's
          <br />
          Trends Today
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          Discover what's next in fashion with our data-driven insights.
        </p>
        <div className="flex space-x-4">
          <Link to="/dashboard" className="px-8 py-3 bg-black text-white font-semibold tracking-wider uppercase border border-black hover:bg-white hover:text-black transition-colors duration-300">
            Upload Pinterest Board
          </Link>
          <a href="#how-it-works" className="px-8 py-3 font-semibold tracking-wider uppercase border border-black hover:bg-black hover:text-white transition-colors duration-300">
            See How It Works
          </a>
        </div>
        <div className="absolute bottom-10 animate-bounce">
          <ArrowDownIcon />
        </div>
      </section>

      {/* What You Can Do Section */}
      <section id="what-you-can-do" className="py-24">
        <h2 className="text-center text-4xl font-bold mb-12 tracking-tight">What You Can Do!</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard title="Predict Trends">
            Upload your style inspo and we'll analyze runway trends to predict what you'll love next.
          </FeatureCard>
          <FeatureCard title="Shop Your Style">
            Get personalized product recommendations that match your aesthetic and budget perfectly.
          </FeatureCard>
          <FeatureCard title="Stay Sustainable">
            Find eco-friendly brands and learn how to upcycle your wardrobe with our sustainability hub.
          </FeatureCard>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 text-center">
        <h2 className="text-4xl font-bold mb-4 tracking-tight">How it works?</h2>
        <p className="text-lg text-gray-600 mb-12">Super easy.</p>
        <div className="relative flex justify-between items-center max-w-4xl mx-auto mb-16">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gray-300 -translate-y-1/2"></div>
          <div className="relative text-center">
            <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold">1</div>
            <p className="font-semibold uppercase tracking-wider">Upload Your Inspo</p>
          </div>
          <div className="relative text-center">
            <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold">2</div>
            <p className="font-semibold uppercase tracking-wider">Trend Analysis</p>
          </div>
          <div className="relative text-center">
            <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold">3</div>
            <p className="font-semibold uppercase tracking-wider">Get Recs</p>
          </div>
        </div>
        <Link to="/dashboard" className="inline-block px-16 py-6 bg-black text-white text-2xl font-bold tracking-widest uppercase border-2 border-black hover:bg-white hover:text-black transition-colors duration-300">
          Start Predicting Trends
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
