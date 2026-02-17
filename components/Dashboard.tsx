
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, WorkoutDay } from '../types';
import { generateWorkoutPlan, generateDietPlan } from '../services/geminiService';

interface DashboardProps {
  userProfile: UserProfile;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile: initialProfile, onReset }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[] | null>(null);
  const [dietPlan, setDietPlan] = useState<any | null>(null);
  const [loadingWorkout, setLoadingWorkout] = useState(false);
  const [loadingDiet, setLoadingDiet] = useState(false);
  const [currentStage, setCurrentStage] = useState<'goal' | 'fitness' | 'timing' | 'diet' | 'complete'>('goal');
  
  // Tracking state for Home Page
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const availableGoals = [
    { id: 'strength', label: 'Strength Training', icon: '🏋️‍♂️' },
    { id: 'cardio', label: 'Cardio Fitness', icon: '🏃‍♂️' },
    { id: 'weight_gain', label: 'Weight Gaining', icon: '💪' },
    { id: 'weight_loss', label: 'Weight Loss', icon: '📉' }
  ];

  const timingOptions = [
    { id: 'early_morning', label: 'Early Morning', time: '06:00 AM', icon: '🌅' },
    { id: 'morning', label: 'Late Morning', time: '10:00 AM', icon: '☀️' },
    { id: 'afternoon', label: 'Afternoon', time: '02:00 PM', icon: '🌤️' },
    { id: 'evening', label: 'Evening', time: '06:00 PM', icon: '🌇' },
    { id: 'night', label: 'Night', time: '09:00 PM', icon: '🌙' }
  ];

  const toggleGoal = (goalId: string) => {
    const currentGoals = profile.goals || [];
    const newGoals = currentGoals.includes(goalId)
      ? currentGoals.filter(g => g !== goalId)
      : [...currentGoals, goalId];
    setProfile({ ...profile, goals: newGoals });
  };

  const handleGoalSubmit = () => {
    if (profile.goals && profile.goals.length > 0) {
      setCurrentStage('fitness');
    }
  };

  const handleFitnessChoice = async (wants: boolean) => {
    setProfile({ ...profile, wantsFitnessPlan: wants });
    if (wants) {
      setCurrentStage('timing');
    } else {
      setCurrentStage('diet');
    }
  };

  const handleTimingSubmit = async () => {
    if (profile.workoutTiming) {
      setLoadingWorkout(true);
      setCurrentStage('diet');
      try {
        const plan = await generateWorkoutPlan(profile);
        setWorkoutPlan(plan);
        // Set active day to current day of week if possible, or just Day 1
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = dayNames[new Date().getDay()];
        const idx = plan.findIndex(d => d.day.toLowerCase().includes(todayName.toLowerCase()));
        setActiveDayIndex(idx !== -1 ? idx : 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingWorkout(false);
      }
    }
  };

  const handleDietSubmit = async (dietType: string, region: string) => {
    const updatedProfile = { ...profile, dietType, region };
    setProfile(updatedProfile);
    setLoadingDiet(true);
    try {
      const plan = await generateDietPlan(updatedProfile);
      setDietPlan(plan);
      setCurrentStage('complete');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDiet(false);
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' };
    if (bmi < 25) return { label: 'Normal', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' };
    return { label: 'Obese', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' };
  };

  const category = getBMICategory(profile.bmi);

  const toggleExercise = (ex: string) => {
    const next = new Set(completedExercises);
    if (next.has(ex)) next.delete(ex);
    else next.add(ex);
    setCompletedExercises(next);
  };

  const estimatedCaloriesBurnt = useMemo(() => {
    if (!workoutPlan || !workoutPlan[activeDayIndex]) return 0;
    // Simple estimation: weight * intensity_factor * count_completed
    const day = workoutPlan[activeDayIndex];
    const perExercise = (profile.weight * 0.5); // Arbitrary formula for demo
    return Math.round(completedExercises.size * perExercise);
  }, [completedExercises, activeDayIndex, workoutPlan, profile.weight]);

  const workoutProgress = useMemo(() => {
    if (!workoutPlan || !workoutPlan[activeDayIndex]) return 0;
    const total = workoutPlan[activeDayIndex].exercises.length;
    return Math.round((completedExercises.size / total) * 100);
  }, [completedExercises, activeDayIndex, workoutPlan]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hi! Strip */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-xl font-bold">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Hi! <span className="text-emerald-500">{profile.name}</span></h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                {currentStage === 'complete' ? "Home Dashboard" : "Onboarding Session"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={onReset} className="p-3 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 rounded-xl" title="Reset Profile">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        
        {/* Stages before completion */}
        {currentStage !== 'complete' && (
           <div className={`p-8 rounded-[2.5rem] glass-card border-2 ${category.border} shadow-xl relative overflow-hidden transition-all duration-700`}>
             <div className="flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="text-center md:text-left">
                 <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Current Health Index</span>
                 <h2 className="text-xl font-bold text-slate-700 mt-1">Body Mass Index (BMI)</h2>
               </div>
               <div className="flex items-center gap-6">
                 <div className="text-right">
                   <span className={`text-5xl font-black text-slate-800`}>{profile.bmi}</span>
                 </div>
                 <div className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-sm ${category.bg} ${category.color} border ${category.border}`}>
                   {category.label}
                 </div>
               </div>
             </div>
           </div>
        )}

        {/* Home Dashboard Stage (COMPLETE) */}
        {currentStage === 'complete' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-8">
            {/* Top Grid: Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* BMI Card */}
              <div className={`p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-between`}>
                <div>
                  <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">Body Index</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900">{profile.bmi}</span>
                    <span className={`text-xs font-bold ${category.color} bg-slate-50 px-2 py-1 rounded-lg`}>{category.label}</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-slate-400 text-xs font-bold">{profile.weight}kg / {profile.height}cm</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
              </div>

              {/* Calories Burnt Card */}
              <div className="p-8 rounded-[2rem] bg-slate-900 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-4">Today's Progress</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black">{estimatedCaloriesBurnt}</span>
                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Kcal Burnt</span>
                  </div>
                  <div className="mt-6">
                    <div className="h-1.5 bg-white/10 rounded-full w-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${workoutProgress}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{workoutProgress}% Complete</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{completedExercises.size} Exercises</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M11.75 2.5a.75.75 0 0 1 .75.75V11h8.5a.75.75 0 0 1 0 1.5H11.75v8.5a.75.75 0 0 1-1.5 0V12.5H1.75a.75.75 0 0 1 0-1.5h8.5V3.25a.75.75 0 0 1 .75-.75z"/></svg>
                </div>
              </div>

              {/* Workout Timing & Alarm */}
              <div className="p-8 rounded-[2rem] bg-indigo-600 text-white shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-indigo-300 text-xs font-black uppercase tracking-widest mb-4">Daily Schedule</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⏰</span>
                    <div>
                      <span className="text-2xl font-black block">{profile.workoutTiming}</span>
                      <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Next Session Alarm {profile.alarmEnabled ? 'Active' : 'Off'}</p>
                    </div>
                  </div>
                </div>
                <button className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                  Adjust Schedule
                </button>
              </div>
            </div>

            {/* Main Content: Tracking & Diet */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Workout Routine Tracking */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                      <span className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">📋</span>
                      Today's Workout Tracking
                    </h3>
                    <select 
                      value={activeDayIndex}
                      onChange={(e) => {
                        setActiveDayIndex(Number(e.target.value));
                        setCompletedExercises(new Set());
                      }}
                      className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-600 focus:ring-0"
                    >
                      {workoutPlan?.map((d, i) => (
                        <option key={i} value={i}>{d.day}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    {workoutPlan && workoutPlan[activeDayIndex] ? (
                      workoutPlan[activeDayIndex].exercises.map((ex, i) => {
                        const isDone = completedExercises.has(ex);
                        return (
                          <div 
                            key={i} 
                            onClick={() => toggleExercise(ex)}
                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 group ${
                              isDone ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${
                              isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white group-hover:border-emerald-500'
                            }`}>
                              {isDone && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <span className={`font-bold transition-all ${isDone ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                              {ex}
                            </span>
                            <span className="ml-auto text-[10px] font-black text-slate-400 opacity-0 group-hover:opacity-100 uppercase tracking-widest">
                              {isDone ? 'Undo' : 'Mark Done'}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-slate-400 text-center py-10 font-bold">No workout plan found for today.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Mini Diet & Tips */}
              <div className="lg:col-span-1 space-y-6">
                <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-6">
                    <span className="p-2 bg-orange-100 text-orange-600 rounded-lg">🍲</span>
                    Nutrition Guide
                  </h3>
                  <div className="space-y-4">
                    {[
                      { l: 'Breakfast', v: dietPlan?.breakfast, c: 'bg-emerald-50' },
                      { l: 'Lunch', v: dietPlan?.lunch, c: 'bg-orange-50' },
                      { l: 'Dinner', v: dietPlan?.dinner, c: 'bg-indigo-50' }
                    ].map((m, i) => (
                      <div key={i} className={`p-4 rounded-2xl ${m.c} border border-white/50`}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{m.l}</p>
                        <p className="text-sm font-bold text-slate-700 leading-tight">{m.v || "Loading..."}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-emerald-500 text-white rounded-[2rem] shadow-xl">
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">💡</span>
                    Health Tip
                  </h3>
                  <p className="text-sm font-bold text-emerald-50 leading-relaxed italic">
                    "{dietPlan?.tips?.[0] || 'Stay consistent and listen to your body signals.'}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROGRESSIVE STAGES (Copied from previous logic for continuity) */}
        
        {currentStage === 'goal' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            <div className="text-center max-w-lg mx-auto">
              <h3 className="text-3xl font-black text-slate-800 mb-2">What's your focus?</h3>
              <p className="text-slate-500">Select one or more goals so we can tailor your experience.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableGoals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className={`p-6 rounded-3xl border-2 transition-all flex items-center gap-6 ${
                    profile.goals?.includes(g.id) 
                      ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-50' 
                      : 'border-white bg-white hover:border-slate-200 shadow-sm'
                  }`}
                >
                  <span className="text-3xl">{g.icon}</span>
                  <span className={`text-lg font-bold ${profile.goals?.includes(g.id) ? 'text-emerald-700' : 'text-slate-600'}`}>{g.label}</span>
                  {profile.goals?.includes(g.id) && (
                    <div className="ml-auto w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                disabled={!profile.goals || profile.goals.length === 0}
                onClick={handleGoalSubmit}
                className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-2xl hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue to Fitness
              </button>
            </div>
          </div>
        )}

        {currentStage === 'fitness' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 text-center space-y-8 max-w-2xl mx-auto">
            <h3 className="text-3xl font-black text-slate-800">Ready for a workout?</h3>
            <p className="text-slate-500 text-lg">Would you like our AI to design a professional 7-day workout plan for you (1-2 hours daily)?</p>
            <div className="flex gap-4">
              <button
                onClick={() => handleFitnessChoice(false)}
                className="flex-1 p-6 bg-white border-2 border-slate-200 text-slate-600 rounded-3xl font-bold hover:bg-slate-50 transition-all"
              >
                No, just Diet
              </button>
              <button
                onClick={() => handleFitnessChoice(true)}
                className="flex-[2] p-6 bg-emerald-500 text-white rounded-3xl font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-600 transition-all"
              >
                Yes, Generate Plan
              </button>
            </div>
          </div>
        )}

        {currentStage === 'timing' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 max-w-2xl mx-auto">
            <div className="text-center">
              <h3 className="text-3xl font-black text-slate-800">Preferred Workout Time</h3>
              <p className="text-slate-500">When do you feel most active during the day?</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {timingOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setProfile({ ...profile, workoutTiming: opt.label })}
                  className={`p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                    profile.workoutTiming === opt.label 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-white bg-white hover:border-slate-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="text-left">
                      <p className={`font-bold ${profile.workoutTiming === opt.label ? 'text-emerald-700' : 'text-slate-700'}`}>{opt.label}</p>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">{opt.time}</p>
                    </div>
                  </div>
                  {profile.workoutTiming === opt.label && (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${profile.alarmEnabled ? 'border-indigo-200 bg-indigo-50' : 'border-slate-100 bg-white'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${profile.alarmEnabled ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'}`}>⏰</div>
                <div>
                  <h4 className={`font-bold ${profile.alarmEnabled ? 'text-indigo-900' : 'text-slate-700'}`}>Set Workout Alarm</h4>
                  <p className="text-xs text-slate-500">Remind me to stay on track daily.</p>
                </div>
              </div>
              <button 
                onClick={() => setProfile({ ...profile, alarmEnabled: !profile.alarmEnabled })}
                className={`w-14 h-8 rounded-full transition-colors relative ${profile.alarmEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${profile.alarmEnabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex justify-center">
              <button
                disabled={!profile.workoutTiming}
                onClick={handleTimingSubmit}
                className="px-12 py-5 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:bg-emerald-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed w-full"
              >
                Confirm & Continue
              </button>
            </div>
          </div>
        )}

        {currentStage === 'diet' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12">
            <div className="p-10 bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-xl space-y-8 animate-in zoom-in-95 duration-500">
                <div className="text-center">
                  <h3 className="text-3xl font-black text-slate-800">Nutrition Profile</h3>
                  <p className="text-slate-500">Let's refine your regional diet chart.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Preference</label>
                    <div className="flex gap-2">
                      {['Veg', 'Non-Veg'].map(type => (
                        <button
                          key={type}
                          onClick={() => setProfile({ ...profile, dietType: type })}
                          className={`flex-1 p-4 rounded-2xl font-bold border-2 transition-all ${
                            profile.dietType === type ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-50 bg-slate-50 text-slate-500'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Region</label>
                    <input
                      type="text"
                      placeholder="e.g. South Indian, Mediterranean"
                      className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none font-bold"
                      onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-center">
                  <button
                    disabled={!profile.dietType || !profile.region || loadingDiet}
                    onClick={() => handleDietSubmit(profile.dietType!, profile.region!)}
                    className="px-12 py-5 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:bg-emerald-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {loadingDiet ? "Consulting AI..." : "Build My Diet Plan"}
                  </button>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
