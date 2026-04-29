import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  User, 
  Clock, 
  Ruler, 
  Weight, 
  Heart, 
  Thermometer, 
  Play, 
  Flame, 
  Check, 
  Save, 
  RotateCcw 
} from 'lucide-react';
import axios from 'axios';
import { supabase } from '../supabaseClient';


const Prediction = ({ user }) => {
  const [formData, setFormData] = useState({
    gender: 'male',
    age: 25,
    height: 170.0,
    weight: 70.0,
    duration: 30,
    heart_rate: 120,
    body_temp: 37.5
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateBurn = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/predict', formData);
      setResult(response.data.prediction);
      setIsSaved(false); // Reset saved status for new result
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.response?.data?.error || 'Failed to connect to the prediction engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || isSaving) return;
    setIsSaving(true);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0];

      // 1. Save prediction record
      const { error: predError } = await supabase.from('ml_predictions').insert({
        user_id: user.id,
        input_params: formData,
        predicted_calories: result,
        model_version: 'v1.0'
      });

      if (predError) {
        if (predError.code === '42P01') {
          throw new Error('Database tables not found. Please run the setup SQL script provided in your Supabase dashboard.');
        }
        throw predError;
      }

      // 2. Update daily activity (Atomic Upsert logic)
      const { data: dailyData, error: fetchError } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const currentBurn = dailyData?.total_calories_burned || 0;
      const currentConsumed = dailyData?.total_calories_consumed || 0;
      const currentGoal = dailyData?.goal_calories || 2500;
      const currentProtein = dailyData?.protein_g || 0;
      const currentCarbs = dailyData?.carbs_g || 0;
      const currentFats = dailyData?.fats_g || 0;

      const { error: dailyError } = await supabase
        .from('daily_activities')
        .upsert({
          user_id: user.id,
          date: today,
          total_calories_burned: currentBurn + result,
          total_calories_consumed: currentConsumed,
          goal_calories: currentGoal,
          protein_g: currentProtein,
          carbs_g: currentCarbs,
          fats_g: currentFats
        }, { onConflict: 'user_id, date' });

      if (dailyError) throw dailyError;

      setIsSaved(true);
    } catch (err) {
      console.error('Prediction save error:', err);
      setError(err.message || 'Failed to save to profile. Please check your database connection.');
    } finally {
      setIsSaving(false);
    }

  };


  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form Column (Takes 2/3) */}
        <section className="lg:col-span-2 glass p-8 rounded-[32px] border-white/5 space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent-green/20 transition-all" />
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-green/20 flex items-center justify-center text-accent-green border border-accent-green/30">
              <Activity size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Metabolic Prediction Engine</h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Synchronized with Backend Model v1.0</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            {/* Gender Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white/60 text-xs font-black uppercase tracking-tighter">
                 <User size={14} className="text-accent-green" />
                 <span>Biological Gender</span>
              </div>
              <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
                {['male', 'female'].map(g => (
                  <button
                    key={g}
                    onClick={() => handleInputChange('gender', g)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                      ${formData.gender === g ? 'bg-accent-green text-black' : 'text-white/40 hover:bg-white/5'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Input */}
            <div className="space-y-4">
               <div className="flex justify-between items-center text-xs">
                 <div className="flex items-center gap-2 text-white/60 font-black uppercase tracking-tighter">
                    <Clock size={14} className="text-accent-purple" />
                    <span>Age (Years)</span>
                 </div>
                 <span className="text-accent-purple font-black text-sm">{formData.age}</span>
               </div>
               <input 
                 type="range" min="1" max="120" step="1" value={formData.age}
                 onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                 className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-accent-purple"
               />
            </div>

            {/* Height Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white/60 text-xs font-black uppercase tracking-tighter">
                 <Ruler size={14} className="text-accent-green" />
                 <span>Height (cm)</span>
              </div>
              <input 
                type="number" step="0.1" value={formData.height}
                onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-sm outline-none focus:border-accent-green/50 transition-all font-bold"
              />
            </div>

            {/* Weight Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white/60 text-xs font-black uppercase tracking-tighter">
                 <Weight size={14} className="text-accent-purple" />
                 <span>Weight (kg)</span>
              </div>
              <input 
                type="number" step="0.1" value={formData.weight}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-sm outline-none focus:border-accent-purple/50 transition-all font-bold"
              />
            </div>

            {/* Duration Input */}
            <div className="space-y-4">
               <div className="flex justify-between items-center text-xs">
                 <div className="flex items-center gap-2 text-white/60 font-black uppercase tracking-tighter">
                    <Clock size={14} className="text-accent-green" />
                    <span>Duration (min)</span>
                 </div>
                 <span className="text-accent-green font-black text-sm">{formData.duration}m</span>
               </div>
               <input 
                 type="range" min="1" max="120" step="1" value={formData.duration}
                 onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                 className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-accent-green"
               />
            </div>

            {/* Heart Rate Input */}
            <div className="space-y-4">
               <div className="flex justify-between items-center text-xs">
                 <div className="flex items-center gap-2 text-white/60 font-black uppercase tracking-tighter">
                    <Heart size={14} className="text-red-400" />
                    <span>Heart Rate (bpm)</span>
                 </div>
                 <span className="text-red-400 font-black text-sm">{formData.heart_rate}</span>
               </div>
               <input 
                 type="range" min="40" max="220" step="1" value={formData.heart_rate}
                 onChange={(e) => handleInputChange('heart_rate', parseInt(e.target.value))}
                 className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-red-400"
               />
            </div>

            {/* Body Temp Input */}
            <div className="space-y-4 md:col-span-2">
               <div className="flex justify-between items-center text-xs">
                 <div className="flex items-center gap-2 text-white/60 font-black uppercase tracking-tighter">
                    <Thermometer size={14} className="text-orange-400" />
                    <span>Body Temperature (°C)</span>
                 </div>
                 <span className="text-orange-400 font-black text-sm">{formData.body_temp.toFixed(1)}°C</span>
               </div>
               <input 
                 type="range" min="35" max="42" step="0.1" value={formData.body_temp}
                 onChange={(e) => handleInputChange('body_temp', parseFloat(e.target.value))}
                 className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-orange-400"
               />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <button 
            onClick={calculateBurn}
            disabled={loading}
            className="w-full py-5 bg-accent-green text-black font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-[0_10px_30px_rgba(163,255,18,0.2)] hover:shadow-[0_15px_40px_rgba(163,255,18,0.4)] disabled:opacity-50"
          >
            {loading ? (
               <div className="w-6 h-6 border-4 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
               <>
                 <Play size={20} className="fill-black" />
                 Initialize Prediction
               </>
            )}
          </button>
        </section>

        {/* Result Card Column (Takes 1/3) */}
        <section className="glass p-8 rounded-[32px] border-white/5 flex flex-col items-center justify-center relative overflow-hidden text-center min-h-[400px]">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-6"
              >
                <div className="relative">
                   <div className="absolute inset-0 bg-accent-green/20 rounded-full blur-[60px] animate-pulse" />
                   <div className="w-48 h-48 rounded-full border-4 border-accent-green/20 flex flex-col items-center justify-center relative bg-background/40 backdrop-blur-xl z-10 mx-auto">
                      <Flame size={48} className="text-accent-green mb-2" />
                      <span className="text-5xl font-black text-white">{result}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Total Kcal Burn</span>
                   </div>
                </div>
                <div className="space-y-2">
                   <h3 className="text-xl font-bold text-white uppercase tracking-tight">Sync Success</h3>
                   <p className="text-white/40 text-[11px] font-black uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                     Neural model processed your metabolic profile with high confidence.
                   </p>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <button 
                    onClick={handleSave}
                    disabled={isSaved}
                    className={`px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 w-full
                      ${isSaved 
                        ? 'bg-accent-green/20 text-accent-green border border-accent-green/40' 
                        : 'bg-white text-black hover:bg-accent-green hover:shadow-[0_0_20px_rgba(163,255,18,0.4)]'}`}
                  >
                    {isSaved ? (
                      <>
                        <Check size={16} />
                        Sync Completed
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save to Profile
                      </>
                    )}
                  </button>

                  <button 
                    onClick={() => setResult(null)}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all flex items-center justify-center gap-2 w-full"
                  >
                    <RotateCcw size={14} />
                    Reset Simulation
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 flex flex-col items-center justify-center"
              >
                <div className="w-48 h-48 rounded-full border-4 border-dashed border-white/10 flex items-center justify-center mx-auto opacity-20">
                   <Activity size={64} className="animate-pulse" />
                </div>
                <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                     Awaiting Synchronization
                   </p>
                   <div className="flex gap-1 justify-center">
                     {[0, 0.2, 0.4].map(d => (
                       <div key={d} className="w-1 h-1 bg-accent-green/30 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                     ))}
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
};

export default Prediction;
