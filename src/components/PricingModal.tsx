import React from 'react';
import { 
  X, 
  Check, 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PricingModalProps {
  onClose: () => void;
  onSelect: (plan: string, credits: number) => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ onClose, onSelect }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-4xl bg-white border border-zinc-200 rounded-[2.5rem] p-10 space-y-8 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-3xl font-display font-bold text-zinc-900">Premium Plans</h3>
            <p className="text-zinc-500">Choose the plan that fits your creative needs.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-900">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Free Plan */}
          <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-6 flex flex-col">
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-zinc-900">Free</h4>
              <div className="text-3xl font-display font-bold text-zinc-900">₹0<span className="text-sm text-zinc-500">/mo</span></div>
            </div>
            <ul className="text-xs text-zinc-500 space-y-3 flex-1">
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 20,000 Credits/mo</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Standard Voices</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Monthly Reset</li>
            </ul>
            <button disabled className="w-full py-3 rounded-xl bg-zinc-100 text-zinc-400 font-bold text-sm">Current Plan</button>
          </div>

          {/* Basic Plan */}
          <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-6 flex flex-col">
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-zinc-900">Basic</h4>
              <div className="text-3xl font-display font-bold text-zinc-900">₹100</div>
            </div>
            <ul className="text-xs text-zinc-500 space-y-3 flex-1">
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 6,000 Credits</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> High Quality Voices</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> No Expiry</li>
            </ul>
            <button onClick={() => onSelect('basic', 6000)} className="w-full py-3 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 transition-all">Buy Now</button>
          </div>

          {/* Pro Plan */}
          <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">Best Value</div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-emerald-700">Pro</h4>
              <div className="text-3xl font-display font-bold text-emerald-700">₹200</div>
            </div>
            <ul className="text-xs text-emerald-600 space-y-3 flex-1">
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 15,000 Credits</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> High Quality Voices</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Priority Support</li>
            </ul>
            <button onClick={() => onSelect('pro', 15000)} className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all">Buy Now</button>
          </div>

          {/* Advanced Plan */}
          <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-6 flex flex-col">
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-zinc-900">Advanced</h4>
              <div className="text-3xl font-display font-bold text-zinc-900">₹400</div>
            </div>
            <ul className="text-xs text-zinc-500 space-y-3 flex-1">
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 30,000 Credits</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> All Premium Features</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Priority Support</li>
            </ul>
            <button onClick={() => onSelect('advanced', 30000)} className="w-full py-3 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 transition-all">Buy Now</button>
          </div>

          {/* Ultra Plan */}
          <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-6 flex flex-col">
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-zinc-900">Ultra</h4>
              <div className="text-3xl font-display font-bold text-zinc-900">₹500</div>
            </div>
            <ul className="text-xs text-zinc-500 space-y-3 flex-1">
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 40,000 Credits</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> All Premium Features</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Custom Voice Profiles</li>
            </ul>
            <button onClick={() => onSelect('ultra', 40000)} className="w-full py-3 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 transition-all">Buy Now</button>
          </div>
        </div>

        <div className="p-6 bg-zinc-50 rounded-3xl text-center space-y-4">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Secure Payments via Razorpay</p>
          <div className="flex flex-wrap justify-center items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex flex-col items-center gap-1">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b2/Google_Pay_Logo.svg" alt="Google Pay" className="h-6" referrerPolicy="no-referrer" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_standalone.svg" alt="Paytm" className="h-4" referrerPolicy="no-referrer" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon Pay" className="h-5" referrerPolicy="no-referrer" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-6" referrerPolicy="no-referrer" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo.png" alt="UPI" className="h-6" referrerPolicy="no-referrer" />
            </div>
          </div>
          <p className="text-[10px] text-zinc-400">
            * 1 Credit = ~10 characters of text. Credits are deducted only on successful generation.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PricingModal;
