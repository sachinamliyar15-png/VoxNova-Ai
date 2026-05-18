import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, ArrowRight, ArrowUp } from 'lucide-react';

const BLOG_ARTICLES = [
  {
    title: "How AI Voice Generators are Changing Content Creation",
    excerpt: "AI voice technology has evolved significantly in recent years. From robotic voices to ultra-realistic human-like speech, the journey has been remarkable. VoxNova Text to Speech uses advanced neural networks to capture the nuances of human emotion...",
    date: "March 28, 2026",
    img: "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=800&h=450",
    content: (
      <article className="space-y-6">
        <h2 className="text-4xl font-display font-bold text-zinc-900">How AI Voice Generators are Changing Content Creation</h2>
        <div className="text-zinc-500 leading-relaxed space-y-4">
          <p className="text-lg font-medium text-zinc-900">AI voice technology has evolved significantly in recent years. From robotic voices to ultra-realistic human-like speech, the journey has been remarkable.</p>
          <p>VoxNova Text to Speech uses advanced neural networks to capture the nuances of human emotion, making it perfect for YouTube creators, filmmakers, and businesses. The ability to generate high-quality audio without a voice actor has opened up new possibilities for small creators.</p>
          <p>With the rise of short-form content like TikTok, Reels, and YouTube Shorts, the demand for quick and effective voiceovers is at an all-time high. AI voices allow creators to iterate faster and produce more content in less time.</p>
          <h3 className="text-2xl font-bold text-zinc-900 pt-4">Why Realism Matters</h3>
          <p>In the past, AI voices were easy to spot. They lacked the natural rhythm and breathing patterns of human speech. Today, VoxNova's technology incorporates these subtle details, making the voices sound 100% realistic.</p>
        </div>
      </article>
    )
  },
  {
    title: "Best Hindi AI Voices for YouTube Shorts and Reels",
    excerpt: "Hindi content is booming on social media. To stand out, you need high-quality voiceovers. VoxNova offers voices like 'Pankaj' and 'Sultan' which are perfect for motivational videos, news, and storytelling in Hindi...",
    date: "March 25, 2026",
    img: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=800&h=450",
    content: (
      <article className="space-y-6">
        <h2 className="text-4xl font-display font-bold text-zinc-900">Best Hindi AI Voices for YouTube Shorts and Reels</h2>
        <div className="text-zinc-500 leading-relaxed space-y-4">
          <p className="text-lg font-medium text-zinc-900">Hindi content is booming on social media. To stand out, you need high-quality voiceovers that resonate with the audience.</p>
          <p>VoxNova offers a specialized library of Hindi voices that are perfect for various niches. For example, 'Pankaj' is an ultra-deep, authoritative voice ideal for news and documentary-style videos. On the other hand, 'Sultan' provides a powerful, warrior-like tone for motivational content.</p>
          <h3 className="text-2xl font-bold text-zinc-900 pt-4">Tips for Hindi Voiceovers</h3>
          <p>When generating Hindi audio, it's important to use proper punctuation. This helps the AI understand where to pause and which words to emphasize. Our Hindi models are trained on native speakers to ensure perfect pronunciation and cultural nuance.</p>
        </div>
      </article>
    )
  },
  {
    title: "The Future of Text to Speech Technology in 2026",
    excerpt: "As we move further into 2026, AI voices are becoming indistinguishable from real humans. VoxNova is at the forefront of this revolution, providing tools for voice cloning, emotional modulation, and real-time dubbing...",
    date: "March 22, 2026",
    img: "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?auto=format&fit=crop&q=80&w=800&h=450",
    content: (
      <article className="space-y-6">
        <h2 className="text-4xl font-display font-bold text-zinc-900">The Future of Text to Speech Technology in 2026</h2>
        <div className="text-zinc-500 leading-relaxed space-y-4">
          <p className="text-lg font-medium text-zinc-900">As we move further into 2026, AI voices are becoming indistinguishable from real humans.</p>
          <p>VoxNova is at the forefront of this revolution, providing tools for voice cloning, emotional modulation, and real-time dubbing. The next step in TTS evolution is the integration of real-time emotional intelligence, where the AI can adapt its tone based on the sentiment of the text automatically.</p>
          <p>We are also seeing a shift towards personalized AI voices, where users can create a unique digital twin of their own voice for use in various applications.</p>
        </div>
      </article>
    )
  },
  {
    title: "How to Create Professional Voiceovers with VoxNova",
    excerpt: "Creating a professional voiceover used to require expensive equipment and a recording studio. Now, with VoxNova Text to Speech, you can generate studio-quality audio in seconds. Learn how to fine-tune your scripts for the best results...",
    date: "March 18, 2026",
    img: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800&h=450",
    content: (
      <article className="space-y-6">
        <h2 className="text-4xl font-display font-bold text-zinc-900">How to Create Professional Voiceovers with VoxNova</h2>
        <div className="text-zinc-500 leading-relaxed space-y-4">
          <p className="text-lg font-medium text-zinc-900">Creating a professional voiceover used to require expensive equipment and a recording studio. Now, you can do it in seconds.</p>
          <p>Step 1: Write a clear script. Use punctuation to guide the AI's rhythm.<br/>Step 2: Choose the right voice. Each voice in VoxNova has a specific 'vibe' described in the library.<br/>Step 3: Fine-tune the settings. Adjust the speed for energy and the pitch for authority.<br/>Step 4: Use 'Studio Clarity' to ensure the output is crisp and professional.</p>
        </div>
      </article>
    )
  }
];

interface InfoModalsProps {
  showAbout: boolean;
  setShowAbout: (val: boolean) => void;
  showContact: boolean;
  setShowContact: (val: boolean) => void;
  showPrivacy: boolean;
  setShowPrivacy: (val: boolean) => void;
  showTerms: boolean;
  setShowTerms: (val: boolean) => void;
  showBlog: boolean;
  setShowBlog: (val: boolean) => void;
  selectedArticle: number | null;
  setSelectedArticle: (val: number | null) => void;
}

const InfoModals: React.FC<InfoModalsProps> = ({
  showAbout, setShowAbout,
  showContact, setShowContact,
  showPrivacy, setShowPrivacy,
  showTerms, setShowTerms,
  showBlog, setShowBlog,
  selectedArticle, setSelectedArticle
}) => {
  return (
    <AnimatePresence>
      {showAbout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAbout(false)}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white p-8 md:p-12 rounded-[2.5rem] border border-zinc-200 shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <button onClick={() => setShowAbout(false)} className="absolute top-6 right-6 p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-900"><X size={20} /></button>
            <div className="space-y-6">
              <h2 className="text-3xl font-display font-bold text-zinc-900">About VoxNova Text to Speech</h2>
              <div className="space-y-4 text-zinc-500 leading-relaxed">
                <p>VoxNova Text to Speech is a cutting-edge AI research lab dedicated to pushing the boundaries of synthetic speech and neural audio generation. Our mission is to democratize high-end cinematic voice production for creators worldwide.</p>
                <p>Founded by a team of audio engineers and AI researchers, we believe that the future of storytelling is multimodal. By combining advanced deep learning with professional audio standards, we provide tools that were once only available to major film studios.</p>
                <p>Our platform is built on the latest Gemini 2.5 architecture, optimized for emotional resonance, natural prosody, and crystal-clear studio fidelity.</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowContact(false)}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white p-8 md:p-12 rounded-[2.5rem] border border-zinc-200 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <button onClick={() => setShowContact(false)} className="absolute top-6 right-6 p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-900"><X size={20} /></button>
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold text-zinc-900">Contact Us</h2>
                <p className="text-zinc-500">Have questions or feedback? We'd love to hear from you.</p>
              </div>

              <div className="space-y-6 text-center py-8">
                <p className="text-zinc-500">Click the button below to send us an email directly from your email client.</p>
                <div className="flex items-center justify-center">
                  <a 
                    href="mailto:robotlinkan@gmail.com" 
                    className="flex items-center gap-3 px-8 py-4 bg-zinc-900 rounded-2xl hover:bg-zinc-800 transition-all text-lg font-bold text-white shadow-xl shadow-zinc-900/20"
                  >
                    <Mail size={24} />
                    Send Email to Support
                  </a>
                </div>
                <p className="text-xs text-zinc-400">Your default email app will open with our support address.</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showPrivacy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowPrivacy(false)}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl bg-white p-8 md:p-12 rounded-[2.5rem] border border-zinc-200 shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <button onClick={() => setShowPrivacy(false)} className="absolute top-6 right-6 p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-900"><X size={20} /></button>
            <div className="space-y-8">
              <h2 className="text-3xl font-display font-bold text-zinc-900">Privacy Policy</h2>
              <div className="space-y-6 text-zinc-500 text-sm leading-relaxed">
                <section className="space-y-2">
                  <h3 className="text-lg font-bold text-zinc-900">1. Data Collection</h3>
                  <p>We collect minimal data necessary to provide our AI services. This includes your email address for authentication and the text scripts you provide for voice generation.</p>
                </section>
                <section className="space-y-2">
                  <h3 className="text-lg font-bold text-zinc-900">2. Audio Data</h3>
                  <p>Generated audio files are stored temporarily to allow you to download them. We do not use your generated audio or input text to train our base models without explicit consent.</p>
                </section>
                <section className="space-y-2">
                  <h3 className="text-lg font-bold text-zinc-900">3. Third-Party Services</h3>
                  <p>We use Google Firebase for authentication and database services, and Google Gemini API for AI processing. Your data is handled according to their respective privacy policies.</p>
                </section>
                <section className="space-y-2">
                  <h3 className="text-lg font-bold text-zinc-900">4. Cookies</h3>
                  <p>We use essential cookies to maintain your session and preferences. We do not use tracking cookies for advertising purposes.</p>
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showTerms && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowTerms(false)}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl bg-white p-8 md:p-12 rounded-[2.5rem] border border-zinc-200 shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <button onClick={() => setShowTerms(false)} className="absolute top-6 right-6 p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-900"><X size={20} /></button>
            <div className="space-y-8">
              <h2 className="text-3xl font-display font-bold text-zinc-900">Terms of Service</h2>
              <div className="space-y-6 text-zinc-500 text-sm leading-relaxed">
                <section className="space-y-2">
                  <h3 className="text-lg font-bold text-zinc-900">1. Acceptable Use</h3>
                  <p>You agree not to use VoxNova Text to Speech to generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable. This includes generating deepfakes for malicious purposes.</p>
                </section>
                <section className="space-y-2">
                  <h3 className="text-lg font-bold text-zinc-900">2. Intellectual Property</h3>
                  <p>You retain ownership of the text scripts you provide. VoxNova Text to Speech grants you a non-exclusive license to use the generated audio for personal or commercial purposes, provided you comply with these terms.</p>
                </section>
                <section className="space-y-2">
                  <h3 className="text-lg font-bold text-zinc-900">3. Service Availability</h3>
                  <p>We strive for 100% uptime but do not guarantee uninterrupted service. We reserve the right to modify or discontinue features at any time.</p>
                </section>
                <section className="space-y-2">
                  <h3 className="text-lg font-bold text-zinc-900">4. Credits & Payments</h3>
                  <p>Credits purchased are non-refundable. Premium features are subject to active subscription status.</p>
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showBlog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setShowBlog(false); setSelectedArticle(null); }}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white p-8 md:p-12 rounded-[2.5rem] border border-zinc-200 shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <button onClick={() => { setShowBlog(false); setSelectedArticle(null); }} className="absolute top-6 right-6 p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-900"><X size={20} /></button>
            
            {selectedArticle === null ? (
              <div className="space-y-8">
                <h2 className="text-4xl font-display font-bold text-zinc-900">VoxNova AI Voice Blog</h2>
                <div className="grid grid-cols-1 gap-8">
                  {BLOG_ARTICLES.map((article, i) => (
                    <div key={`blog-list-${i}`} className="p-6 rounded-3xl border border-zinc-100 hover:border-emerald-500/20 transition-all cursor-pointer" onClick={() => setSelectedArticle(i)}>
                      <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-2">{article.date}</div>
                      <h3 className="text-2xl font-bold text-zinc-900 mb-3">{article.title}</h3>
                      <p className="text-zinc-500 leading-relaxed mb-4">{article.excerpt}</p>
                      <div className="text-emerald-600 font-bold flex items-center gap-2">Read Full Article <ArrowRight size={16} /></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <button onClick={() => setSelectedArticle(null)} className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 font-medium">
                  <ArrowUp className="-rotate-90" size={16} /> Back to Blog
                </button>
                
                {BLOG_ARTICLES[selectedArticle].content}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InfoModals;
