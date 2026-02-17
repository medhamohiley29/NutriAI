
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: ''
  });

  const calculateBMI = (h: number, w: number) => {
    const heightInMeters = h / 100;
    return parseFloat((w / (heightInMeters * heightInMeters)).toFixed(1));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      const h = parseFloat(formData.height);
      const w = parseFloat(formData.weight);
      const bmi = calculateBMI(h, w);
      onComplete({
        name: formData.name,
        age: parseInt(formData.age),
        height: h,
        weight: w,
        bmi: bmi
      });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.name.trim().length > 1;
      case 2: return parseInt(formData.age) > 0 && parseInt(formData.age) < 120;
      case 3: return parseFloat(formData.height) > 50 && parseFloat(formData.height) < 250;
      case 4: return parseFloat(formData.weight) > 10 && parseFloat(formData.weight) < 500;
      default: return false;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      <div className="w-full max-w-md p-10 glass-card rounded-[2.5rem] shadow-2xl transition-all duration-500">
        <div className="mb-10 text-center">
          <div className="inline-block p-4 rounded-3xl bg-emerald-500 text-white mb-6 shadow-lg shadow-emerald-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">NutriFlow AI</h1>
          <div className="flex justify-center mt-4 gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-300 ${i <= step ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Hello there!</h2>
              <p className="text-slate-500 mb-6">What's your name?</p>
              <input
                type="text" autoFocus placeholder="Enter your name"
                className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition-all text-xl font-medium"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && isStepValid() && handleNext()}
              />
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Age?</h2>
              <p className="text-slate-500 mb-6">Helps us calculate metabolism.</p>
              <input
                type="number" autoFocus placeholder="Age"
                className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition-all text-xl font-medium"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && isStepValid() && handleNext()}
              />
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">How tall are you?</h2>
              <p className="text-slate-500 mb-6">Enter height in centimeters.</p>
              <input
                type="number" autoFocus placeholder="CM"
                className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition-all text-xl font-medium"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && isStepValid() && handleNext()}
              />
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Finally, weight?</h2>
              <p className="text-slate-500 mb-6">Enter weight in kilograms.</p>
              <input
                type="number" autoFocus placeholder="KG"
                className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition-all text-xl font-medium"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && isStepValid() && handleNext()}
              />
            </div>
          )}

          <div className="flex gap-4 pt-4">
            {step > 1 && (
              <button onClick={handleBack} className="p-5 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`flex-1 p-5 rounded-2xl font-bold text-white shadow-xl transition-all duration-300 ${
                isStepValid() ? 'bg-emerald-500 hover:bg-emerald-600 scale-[1.02]' : 'bg-slate-200 cursor-not-allowed'
              }`}
            >
              {step === 4 ? 'See My BMI' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
