import Link from 'next/link';
import { ArrowRight, Sparkles, FileText, Code, Palette } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans selection:bg-blue-500/30">

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 border-b border-white/5 bg-transparent backdrop-blur-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="font-bold text-2xl tracking-tight">
            <span className="text-blue-500">Idea</span>Forge
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
          </nav>
          <div className="flex items-center gap-4">
          </div>
        </div>
      </header>

      {/* Hero Section with Background */}
      <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden pt-20">

        {/* Background Image & Gradients */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950/60 to-gray-950"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,7,18,1)_100%)]"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">

          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium backdrop-blur-sm">
            <Sparkles size={14} />
            <span>AI-Powered Product Architect</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-400 drop-shadow-2xl">
            From Spark <br /> to <span className="text-blue-500">Spec</span>.
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mb-10 leading-relaxed drop-shadow-md">
            Turn your raw idea into a professional <span className="text-white font-semibold">PRD</span>, <span className="text-white font-semibold">Design System</span>, and <span className="text-white font-semibold">Tech Stack</span> in minutes.
          </p>

          <Link
            href="/interview"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] mb-20"
          >
            Start New Idea
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full max-w-6xl relative z-10 -mt-20">
            {[
              { icon: FileText, title: "Instant PRDs", desc: "User stories & acceptance criteria generated automatically." },
              { icon: Palette, title: "Design Systems", desc: "Color palettes and typography tailored to your vibe." },
              { icon: Code, title: "Tech Specs", desc: "Database schemas and API endpoints ready for dev." }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-gray-900/50 border border-white/5 backdrop-blur-md hover:bg-gray-800/50 transition-colors text-left">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-gray-950 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-500 text-sm">
            &copy; 2025 IdeaForge. Open Source Software.
          </div>
          <div className="flex gap-6 text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="https://github.com/yourusername/ideaforge" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div >
  );
}
