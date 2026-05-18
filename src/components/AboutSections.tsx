import React from 'react';
import { 
  Sparkles, 
  Globe, 
  Clapperboard, 
  Mic, 
  Layers, 
  Zap, 
  Video, 
  ArrowRight,
  Play
} from 'lucide-react';
import { motion } from 'motion/react';

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

const AboutSections: React.FC<{ onShowBlog?: (idx: number) => void }> = ({ onShowBlog }) => {
  return (
    <div className="space-y-0">
      {/* SEO Content Section */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto py-24 px-6 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-zinc-900 tracking-tight">Why Choose VoxNova Text to Speech?</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto text-lg">VoxNova is the world's most advanced AI voice generation platform, designed for creators who demand cinematic quality.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 rounded-[2.5rem] space-y-6 border border-zinc-100 hover:border-emerald-500/20 transition-all group bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 duration-300">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-inner">
                <Sparkles size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-zinc-900">Ultra-Realistic Voices</h3>
                <p className="text-zinc-500 leading-relaxed">Our neural networks are trained on thousands of hours of professional studio recordings to capture the subtle nuances of human speech, including breath, rhythm, and emotion.</p>
              </div>
            </div>

            <div className="p-10 rounded-[2.5rem] space-y-6 border border-zinc-100 hover:border-blue-500/20 transition-all group bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 duration-300">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
                <Globe size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-zinc-900">Multilingual Support</h3>
                <p className="text-zinc-500 leading-relaxed">Generate high-quality voiceovers in English and Hindi with perfect native accents. Our AI understands cultural nuances and provides localized performances for global audiences.</p>
              </div>
            </div>

            <div className="p-10 rounded-[2.5rem] space-y-6 border border-zinc-100 hover:border-purple-500/20 transition-all group bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 duration-300">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-inner">
                <Clapperboard size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-zinc-900">Cinematic Narration</h3>
                <p className="text-zinc-500 leading-relaxed">From deep movie trailer voices to calm documentary narrators, VoxNova provides the perfect tone for any project. Use our advanced style controls to fine-tune the performance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Tools Section */}
      <section className="bg-zinc-50/80 py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-16">
          <div className="p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-zinc-100 bg-white shadow-sm space-y-10">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-bold text-zinc-900">Professional Grade AI Tools</h3>
              <p className="text-zinc-500">Everything you need to create world-class audio content.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="flex gap-6">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Mic size={24} />
                </div>
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-zinc-900">AI Voice Cloning</h4>
                  <p className="text-zinc-500 leading-relaxed">Clone any voice with just a few seconds of audio. Perfect for maintaining consistency across long-running series or dubbing content while keeping the original actor's essence.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <Layers size={24} />
                </div>
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-zinc-900">Advanced Style Modulation</h4>
                  <p className="text-zinc-500 leading-relaxed">Go beyond simple pitch and speed. Our AI allows you to control the emotional intensity, gravitas, and storytelling style of every generation, giving you full creative control.</p>
                </div>
              </div>
            </div>
          </div>

          {/* How it Works */}
          <div className="space-y-16">
            <div className="text-center space-y-4">
              <h3 className="text-4xl font-display font-bold text-zinc-900">How VoxNova Text to Speech Works</h3>
              <p className="text-zinc-500 max-w-xl mx-auto">Four simple steps to transform your text into professional audio.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Input Text', desc: 'Paste your script into our advanced editor. We support long-form content up to 5,000 characters.', img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=400&h=300' },
                { step: '02', title: 'Select Voice', desc: 'Browse our library of 50+ professional AI voices, each with unique traits and characteristics.', img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=400&h=300' },
                { step: '03', title: 'Fine-Tune', desc: 'Adjust pitch, speed, and emotional style to get the perfect performance for your project.', img: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=400&h=300' },
                { step: '04', title: 'Generate', desc: 'Our neural engines process your request in seconds, delivering studio-quality 48kHz audio.', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400&h=300' }
              ].map((item, i) => (
                <div key={`step-en-${i}`} className="space-y-6 group">
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm group-hover:shadow-md transition-all duration-300">
                    <motion.div
                      className="w-full h-full"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 1, -1, 0]
                      }}
                      transition={{ 
                        duration: 6, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    >
                      <img src={item.img} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700" referrerPolicy="no-referrer" />
                    </motion.div>
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-xl font-display font-bold text-zinc-900 shadow-sm">
                      {item.step}
                    </div>
                  </div>
                  <div className="space-y-2 px-2">
                    <h4 className="text-xl font-bold text-zinc-900">{item.title}</h4>
                    <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-display font-bold text-zinc-900">Latest from our AI Voice Blog</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto text-lg">Explore the latest trends in AI voice technology, text to speech tips, and content creation strategies.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
            {BLOG_ARTICLES.map((article, i) => (
              <div 
                key={`article-${i}`} 
                className="group cursor-pointer space-y-6" 
                onClick={() => onShowBlog?.(i)}
              >
                <div className="aspect-video rounded-[2rem] overflow-hidden border border-zinc-100 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-500 relative">
                  <img src={article.img} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-zinc-900 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-500 shadow-xl">
                      <Play size={32} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3 px-2">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">{article.date}</span>
                    <span className="text-zinc-300">•</span>
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">AI Technology</span>
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors leading-tight">{article.title}</h3>
                  <p className="text-zinc-500 leading-relaxed line-clamp-2">{article.excerpt}</p>
                   <div className="pt-2 flex items-center gap-2 text-emerald-600 font-bold text-sm group-hover:gap-3 transition-all">
                      Read Article <ArrowRight size={18} />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hindi Voiceovers Section */}
      <section className="bg-emerald-50/50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="glass-panel p-12 md:p-20 rounded-[4rem] border border-zinc-100 bg-white shadow-xl shadow-emerald-900/5 space-y-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="text-center space-y-4 relative z-10">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-zinc-900">VoxNova Text to Speech: Professional Hindi Voiceovers</h2>
              <p className="text-zinc-600 max-w-2xl mx-auto text-lg">VoxNova is a premium AI voice generator that enables you to create high-quality Hindi voiceovers with ease.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <Video size={28} />
                </div>
                <div className="space-y-3">
                  <h4 className="text-2xl font-bold text-zinc-900">Perfect for YouTube and Reels</h4>
                  <p className="text-zinc-600 leading-relaxed text-lg">
                    Whether you're creating YouTube videos or Instagram Reels, our voices will make your content more engaging. Voices like 'Pankaj' and 'Sultan' are perfect for motivational and news content.
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <Zap size={28} />
                </div>
                <div className="space-y-3">
                  <h4 className="text-2xl font-bold text-zinc-900">Fast and Easy Voice Generation</h4>
                  <p className="text-zinc-600 leading-relaxed text-lg">
                    Simply type your text, choose your favorite voice, and click 'Generate'. Your professional voiceover will be ready in seconds. You can also customize the pitch and speed to suit your needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <h3 className="text-4xl font-display font-bold text-zinc-900">Frequently Asked Questions</h3>
            <p className="text-zinc-500">Everything you need to know about VoxNova.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { q: "What is VoxNova Text to Speech?", a: "VoxNova is an advanced AI voice generation platform that converts text into realistic, human-like speech using neural networks." },
              { q: "Is VoxNova free to use?", a: "We offer both free and premium plans. Free users get a daily credit limit, while premium users enjoy unlimited generations and high-fidelity voices." },
              { q: "Can I use VoxNova voices for commercial projects?", a: "Yes, all audio generated with VoxNova can be used for commercial projects, including YouTube, social media, and professional presentations." },
              { q: "How many languages does VoxNova support?", a: "Currently, we specialize in high-quality English and Hindi voices, with more languages being added regularly." },
              { q: "How do I get the best quality AI voice?", a: "For the best results, use proper punctuation in your scripts and adjust the 'Style' and 'Pitch' settings to match your content's mood." },
              { q: "Does VoxNova support voice cloning?", a: "Yes, our premium plan includes AI voice cloning technology that allows you to create a digital version of any voice from a short sample." }
            ].map((faq, i) => (
              <div key={`faq-${i}`} className="p-8 bg-zinc-50/50 rounded-[2rem] border border-zinc-100 space-y-3 hover:bg-white hover:shadow-lg transition-all duration-300">
                <h4 className="text-lg font-bold text-zinc-900 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {faq.q}
                </h4>
                <p className="text-zinc-500 leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutSections;
