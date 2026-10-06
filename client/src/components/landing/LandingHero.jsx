import { Link } from 'react-router-dom';

export default function LandingHero({ onCreateGoal, showNav = true }) {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      {showNav && (
        <nav className="flex items-center justify-between px-6 py-4">
          <div className="text-2xl font-extrabold tracking-tight">
            <span className="text-comet-violet">Future</span>Era
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-dust-gray hover:text-starlight transition-colors">
              Log in
            </Link>
            <button
              onClick={onCreateGoal}
              className="btn-primary text-sm py-2 px-4"
            >
              Get Started
            </button>
          </div>
        </nav>
      )}

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-starlight leading-tight">
              Shape Your Future with AI
            </h1>
            <p className="text-lg text-dust-gray leading-relaxed max-w-xl">
              Transform your career aspirations into actionable roadmaps. Our AI-powered platform creates personalized learning paths, tracks your progress, and connects you with opportunities to achieve your professional goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onCreateGoal}
                className="btn-primary text-base py-3 px-6 font-semibold"
              >
                Create My Career Roadmap
              </button>
              <Link
                to="/dashboard"
                className="btn-secondary text-base py-3 px-6 font-semibold"
              >
                Explore Careers
              </Link>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative">
            {/* Main illustration placeholder */}
            <div className="relative bg-gradient-to-br from-comet-violet/20 to-aurora-teal/20 rounded-3xl p-8">
              <div className="flex items-center justify-center min-h-[400px]">
                <img
                  src="/dashboard-illustration.jpg"
                  alt="Woman working on laptop"
                  className="max-w-full max-h-[400px] object-contain"
                />
              </div>

              {/* Feature Cards */}
              <div className="absolute top-4 left-4 card p-4 shadow-lg animate-float" style={{ animationDelay: '0s' }}>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <p className="text-xs font-bold text-starlight">Find Your Career Path</p>
                    <p className="text-[10px] text-dust-gray">Discover your ideal career</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-4 right-4 card p-4 shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📚</div>
                  <div>
                    <p className="text-xs font-bold text-starlight">Learn New Skills</p>
                    <p className="text-[10px] text-dust-gray">Curated learning resources</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 card p-4 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🗺️</div>
                  <div>
                    <p className="text-xs font-bold text-starlight">Build Your Roadmap</p>
                    <p className="text-[10px] text-dust-gray">Step-by-step guidance</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 card p-4 shadow-lg animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <p className="text-xs font-bold text-starlight">Achieve Your Goals</p>
                    <p className="text-[10px] text-dust-gray">Track your progress</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="card p-6 text-center">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-lg font-bold text-starlight mb-2">Personalized Roadmaps</h3>
            <p className="text-sm text-dust-gray">
              AI-generated career paths tailored to your goals, background, and learning style
            </p>
          </div>

          <div className="card p-6 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-bold text-starlight mb-2">AI-Powered Guidance</h3>
            <p className="text-sm text-dust-gray">
              Get intelligent recommendations and adapt your path as you progress
            </p>
          </div>

          <div className="card p-6 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-bold text-starlight mb-2">Career Insights</h3>
            <p className="text-sm text-dust-gray">
              Track your progress, compare with peers, and discover job opportunities
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
