import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleGetStarted = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-vintage-gray bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-serif font-bold text-vintage-navy cursor-pointer" onClick={() => navigate('/')}>
              JobEase
            </h1>
            <div>
              {!currentUser && (
                <button
                  onClick={() => navigate('/login')}
                  className="text-vintage-navy font-medium hover:text-vintage-gold mr-4 transition-colors"
                >
                  Sign In
                </button>
              )}
              <button
                onClick={handleGetStarted}
                className="vintage-button py-2 px-4 shadow-none hover:shadow-md"
              >
                {currentUser ? 'Dashboard' : 'Get Started'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-grow flex items-center bg-vintage-cream relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#c5a059 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full text-center">
          <span className="text-vintage-gold font-bold tracking-widest uppercase text-sm mb-4 block">AI-Powered Interview Prep</span>
          <h1 className="text-5xl md:text-7xl font-serif text-vintage-navy mb-6 leading-tight">
            Master Your <br />
            <span className="italic text-vintage-dark">Interview Skills</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-vintage-dark/70 mb-10 font-light">
            Transform your preparation with our sophisticated AI interviewer.
            Receive personalized feedback and build confidence for your dream role.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={handleGetStarted} className="vintage-button sm:w-auto text-lg px-10">
              Start Practicing Now
            </button>
            <button className="px-10 py-3 border border-vintage-navy text-vintage-navy font-medium rounded-sm hover:bg-vintage-navy hover:text-white transition-all duration-200">
              How It Works
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="p-8 text-center border border-vintage-gray/30 rounded-sm hover:border-vintage-gold/50 transition-colors duration-300">
              <span className="text-4xl mb-6 block">🤖</span>
              <h3 className="text-2xl font-serif text-vintage-navy mb-4">AI-Powered</h3>
              <p className="text-vintage-dark/70 text-lg">Sophisticated algorithms that adapt to your responses in real-time.</p>
            </div>
            <div className="p-8 text-center border border-vintage-gray/30 rounded-sm hover:border-vintage-gold/50 transition-colors duration-300">
              <span className="text-4xl mb-6 block">⚡</span>
              <h3 className="text-2xl font-serif text-vintage-navy mb-4">Focused Sessions</h3>
              <p className="text-vintage-dark/70 text-lg">Efficient 10-minute practice blocks designed for busy professionals.</p>
            </div>
            <div className="p-8 text-center border border-vintage-gray/30 rounded-sm hover:border-vintage-gold/50 transition-colors duration-300">
              <span className="text-4xl mb-6 block">📊</span>
              <h3 className="text-2xl font-serif text-vintage-navy mb-4">Instant Insight</h3>
              <p className="text-vintage-dark/70 text-lg">Detailed analytics and actionable feedback after every session.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-vintage-navy py-16 text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-4">
              <div className="text-4xl font-serif font-bold text-vintage-gold mb-2">10K+</div>
              <div className="text-white/70">Candidates Prepared</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-serif font-bold text-vintage-gold mb-2">95%</div>
              <div className="text-white/70">Success Rate</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-serif font-bold text-vintage-gold mb-2">50+</div>
              <div className="text-white/70">Partner Companies</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
