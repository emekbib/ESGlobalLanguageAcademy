'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export default function ContactSection() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const services = [
    'Amharic Lessons',
    'Tigrigna Lessons',
    'Somali Lessons',
    'Afaan Oromo Lessons',
    'Swahili Lessons',
    'Interpreter Training',
    'Other'
  ];

  return (
    <section className="bg-[#0c0a09] py-20 sm:py-32 relative overflow-hidden border-t border-white/5">
      {/* Soft gradient background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900/20 via-[#0c0a09] to-[#0c0a09]" />
      
      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-[10px] sm:text-xs font-bold tracking-widest text-amber-500/80 uppercase mb-3">Get In Touch</p>
          <h2 className="font-display text-3xl sm:text-5xl font-medium tracking-tight text-white mb-6">
            Let&apos;s start your language <br className="hidden sm:block"/> journey together.
          </h2>
          <p className="text-stone-400 text-sm sm:text-lg max-w-2xl mx-auto">
            Whether you&apos;re looking to reconnect with your heritage, prepare for a trip, or train as a professional interpreter, we&apos;d love to hear what you&apos;re working on.
          </p>
        </div>

        <div className="bg-[#151312] border border-stone-800/60 rounded-3xl p-5 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle noise/texture overlay if needed */}
          <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay pointer-events-none" />
          
          <form className="relative z-10 space-y-6 sm:space-y-8" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs sm:text-sm font-medium text-stone-400">Name</label>
                <input
                  type="text"
                  id="name"
                  className="w-full bg-[#0c0a09] border border-stone-800/80 rounded-xl px-4 py-3 sm:py-3.5 text-stone-200 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs sm:text-sm font-medium text-stone-400">Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full bg-[#0c0a09] border border-stone-800/80 rounded-xl px-4 py-3 sm:py-3.5 text-stone-200 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm"
                  placeholder="you@email.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs sm:text-sm font-medium text-stone-400">Service</label>
              <div className="flex flex-wrap gap-2">
                {services.map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => setSelectedService(service)}
                    className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium border transition-all ${
                      selectedService === service
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                        : 'bg-[#0c0a09] border-stone-800/80 text-stone-400 hover:border-stone-600 hover:text-stone-200'
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="project" className="text-xs sm:text-sm font-medium text-stone-400">Tell us about your goals</label>
              <textarea
                id="project"
                rows={4}
                className="w-full bg-[#0c0a09] border border-stone-800/80 rounded-xl px-4 py-3 sm:py-3.5 text-stone-200 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all resize-none text-sm"
                placeholder="Share your language goals, timeline, and what you're looking to accomplish..."
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#b47a46] hover:bg-[#c2844f] text-[#2c1d11] font-bold text-sm sm:text-base py-3.5 sm:py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg"
              >
                Start Your Journey
                <Send className="w-4 h-4 opacity-80 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
            
            <p className="text-center text-[10px] sm:text-xs text-stone-500 mt-4">
              Have specific questions? You can also email us directly at support@esgloballanguage.com
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
