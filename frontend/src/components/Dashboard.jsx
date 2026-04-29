import { useState, useEffect } from 'react';
import { 
  Flame, 
  Target, 
  PieChart, 
  Activity, 
  Clock, 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  Utensils,
  Edit3,
  X 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadialBarChart, 
  RadialBar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import Card from './Card';
import { supabase } from '../supabaseClient';

// Initial state constants
const initialMealForm = {
  name: '',
  calories: '',
  protein: '',
  carbs: '',
  fats: '',
  type: 'Meal'
};


const Dashboard = ({ user }) => {
  const [dailyStats, setDailyStats] = useState({
    consumed: 0,
    burned: 0,
    goal: 2500,
    protein: 0,
    carbs: 0,
    fats: 0
  });
  const [chartView, setChartView] = useState('Week');
  const [chartData, setChartData] = useState([]);
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [mealForm, setMealForm] = useState(initialMealForm);
  const [isSavingMeal, setIsSavingMeal] = useState(false);
  const [aiPlan, setAiPlan] = useState({
    targetCalories: 2500,
    weeklyWeightLoss: 0.5,
    calorieDeficit: 500,
    goalName: 'Balanced deficit goal'
  });

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isSavingGoals, setIsSavingGoals] = useState(false);
  const [goalForm, setGoalForm] = useState({
    targetCalories: 2500,
    calorieDeficit: 500,
    weeklyWeightLoss: 0.5,
    goalName: 'Balanced deficit goal'
  });

  const handleSaveGoals = async (e) => {
    e.preventDefault();
    if (!user || isSavingGoals) return;
    setIsSavingGoals(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 1. Update daily_activities for immediate goal change
      const { data: dailyData, error: fetchError } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (fetchError) throw fetchError;

      await supabase.from('daily_activities').upsert({
        user_id: user.id,
        date: today,
        goal_calories: parseFloat(goalForm.targetCalories),
        total_calories_burned: dailyData?.total_calories_burned || 0,
        total_calories_consumed: dailyData?.total_calories_consumed || 0,
        protein_g: dailyData?.protein_g || 0,
        carbs_g: dailyData?.carbs_g || 0,
        fats_g: dailyData?.fats_g || 0
      }, { onConflict: 'user_id, date' });

      // 2. Update user_plans to persist as the latest setting
      await supabase.from('user_plans').insert({
        user_id: user.id,
        plan_name: `Manual Update - ${new Date().toLocaleDateString()}`,
        fitness_goal: goalForm.goalName,
        target_calories: parseFloat(goalForm.targetCalories),
        weight_goal_per_week: parseFloat(goalForm.weeklyWeightLoss),
        calorie_deficit: parseFloat(goalForm.calorieDeficit),
        plan_content: `Manually set goal: ${goalForm.goalName}`
      });

      // 3. Update local states
      setDailyStats(prev => ({ ...prev, goal: parseFloat(goalForm.targetCalories) }));
      setAiPlan({
        targetCalories: parseFloat(goalForm.targetCalories),
        weeklyWeightLoss: parseFloat(goalForm.weeklyWeightLoss),
        calorieDeficit: parseFloat(goalForm.calorieDeficit),
        goalName: goalForm.goalName
      });

      setIsGoalModalOpen(false);
    } catch (err) {
      console.error('Goal save error:', err);
      alert('Failed to save goals. Please try again.');
    } finally {
      setIsSavingGoals(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, chartView]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 1. Fetch Today's Stats (Consumed, Goal, Macros)
      const { data: todayData, error: todayError } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (!todayError && todayData) {
        setDailyStats({
          consumed: todayData.total_calories_consumed || 0,
          burned: todayData.total_calories_burned || 0,
          goal: todayData.goal_calories || 2500,
          protein: todayData.protein_g || 0,
          carbs: todayData.carbs_g || 0,
          fats: todayData.fats_g || 0
        });
      }

      // 2. Fetch Chart Data based on current view
      let startDate = new Date();
      if (chartView === 'Week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (chartView === 'Month') {
        startDate.setDate(startDate.getDate() - 30);
      }

      if (chartView === 'Day') {
        // Fetch individual predictions for today to show hourly trend
        const { data: predictions, error: predError } = await supabase
          .from('ml_predictions')
          .select('created_at, predicted_calories')
          .eq('user_id', user.id)
          .gte('created_at', today + 'T00:00:00')
          .order('created_at', { ascending: true });

        if (!predError && predictions?.length > 0) {
          const formatted = predictions.map(p => ({
            name: new Date(p.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            calories: p.predicted_calories
          }));
          setChartData(formatted);
        } else {
          setChartData([{ name: '00:00', calories: 0 }, { name: 'Now', calories: dailyStats.burned }]);
        }
      } else {
        // Fetch from daily_activities for Week/Month
        const { data: history, error: historyError } = await supabase
          .from('daily_activities')
          .select('date, total_calories_burned')
          .eq('user_id', user.id)
          .gte('date', startDate.toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (!historyError && history?.length > 0) {
          const formatted = history.map(d => ({
            name: chartView === 'Week' 
              ? new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })
              : new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
            calories: d.total_calories_burned
          }));
          setChartData(formatted);
        } else {
          setChartData([]);
        }
      }
      // 3. Fetch Today's Meals from meals_log
      const { data: mealData, error: mealError } = await supabase
        .from('meals_log')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (!mealError && mealData) {
        setMeals(mealData.map(m => ({
          ...m,
          time: new Date(m.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          cal: m.calories
        })));
      } else {
        setMeals([]);
      }

      // 4. Fetch the Latest AI Plan for Goals
      const { data: latestPlan, error: planError } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!planError && latestPlan) {
        setAiPlan({
          targetCalories: latestPlan.target_calories || 2500,
          weeklyWeightLoss: latestPlan.weight_goal_per_week || 0.5,
          calorieDeficit: latestPlan.calorie_deficit || 500,
          goalName: latestPlan.fitness_goal || 'Custom AI Plan'
        });
      }
    } catch (err) {
      console.error('Critical Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMeal = async (e) => {
    e.preventDefault();
    if (!user || isSavingMeal) return;

    setIsSavingMeal(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const calories = parseFloat(mealForm.calories) || 0;
      const protein = parseFloat(mealForm.protein) || 0;
      const carbs = parseFloat(mealForm.carbs) || 0;
      const fats = parseFloat(mealForm.fats) || 0;

      // 1. Fetch current daily record to preserve burned calories and latest goal
      const { data: currentData, error: fetchError } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const updatedConsumed = (currentData?.total_calories_consumed || 0) + calories;
      const updatedProtein = (currentData?.protein_g || 0) + protein;
      const updatedCarbs = (currentData?.carbs_g || 0) + carbs;
      const updatedFats = (currentData?.fats_g || 0) + fats;

      // 2. Insert into meals_log
      const { data: newMeal, error: mealError } = await supabase
        .from('meals_log')
        .insert({
          user_id: user.id,
          name: mealForm.name,
          calories,
          protein,
          carbs,
          fats,
          type: mealForm.type,
          date: today
        })
        .select()
        .single();

      if (mealError) throw mealError;

      // 3. Update state and persistence layer (Atomic Upsert)
      setDailyStats(prev => ({
        ...prev,
        consumed: updatedConsumed,
        protein: updatedProtein,
        carbs: updatedCarbs,
        fats: updatedFats
      }));

      // Update local meals list
      setMeals(prev => [{
        ...newMeal,
        time: new Date(newMeal.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        cal: newMeal.calories
      }, ...prev]);

      await supabase.from('daily_activities').upsert({
        user_id: user.id,
        date: today,
        total_calories_consumed: updatedConsumed,
        total_calories_burned: currentData?.total_calories_burned || 0,
        goal_calories: currentData?.goal_calories || dailyStats.goal,
        protein_g: updatedProtein,
        carbs_g: updatedCarbs,
        fats_g: updatedFats
      }, { onConflict: 'user_id, date' });

      setIsMealModalOpen(false);
      setMealForm(initialMealForm);
    } catch (err) {
      console.error('Meal save error:', err);
      alert('Failed to save meal. Please ensure your database table is set up.');
    } finally {
      setIsSavingMeal(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-green/20 border-t-accent-green rounded-full animate-spin" />
      </div>
    );
  }

  // Derived values
  const percentReached = Math.min(Math.round((dailyStats.consumed / dailyStats.goal) * 100), 100);
  const remaining = Math.max(dailyStats.goal - dailyStats.consumed, 0);

  const macroData = [
    { name: 'Protein', value: dailyStats.protein, max: 180, color: '#A3FF12' },
    { name: 'Carbs', value: dailyStats.carbs, max: 250, color: '#C084FC' },
    { name: 'Fats', value: dailyStats.fats, max: 80, color: '#FF7D05' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 overflow-y-auto max-h-[calc(100vh-120px)] pr-2 custom-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      
      {/* Top Row Stats */}
      <Card title="Daily Progress" icon={Flame} className="lg:col-span-1">
        <div className="flex flex-col items-center">
            <div className="w-[180px] h-[180px] relative mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                        cx="50%" cy="50%" 
                        innerRadius="80%" 
                        outerRadius="100%" 
                        barSize={12} 
                        data={[{ value: percentReached }]}
                        startAngle={180}
                        endAngle={-180}
                    >
                        <RadialBar
                            minAngle={15}
                            background
                            clockWise
                            dataKey="value"
                            cornerRadius={10}
                            fill="#A3FF12"
                        />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white">{dailyStats.consumed}</span>
                    <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Consumed</span>
                </div>
            </div>
            <div className="w-full mt-6 flex justify-between items-center glass p-3 rounded-2xl border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent-green shadow-[0_0_8px_rgba(163,255,18,1)]" />
                    <span className="text-xs text-white/60 font-semibold tracking-wide">{percentReached}% Reached</span>
                </div>
                <span className="text-xs text-accent-green font-bold">{remaining} to go</span>
            </div>
        </div>
      </Card>

      <Card 
        title="Goal & Target" 
        icon={Target} 
        className="lg:col-span-1"
        extra={
          <button 
            onClick={() => {
              setGoalForm({
                targetCalories: dailyStats.goal,
                calorieDeficit: aiPlan.calorieDeficit,
                weeklyWeightLoss: aiPlan.weeklyWeightLoss,
                goalName: aiPlan.goalName
              });
              setIsGoalModalOpen(true);
            }}
            className="p-2 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-accent-green transition-all"
          >
            <Edit3 size={14} />
          </button>
        }
      >
        <div className="space-y-6 mt-4">
           <div className="flex justify-between items-end">
              <div>
                <span className="text-5xl font-black text-white">{dailyStats.goal}</span>
                <span className="text-white/40 text-sm ml-2 font-bold uppercase tracking-wider">kcal</span>
              </div>
              <div className="text-right">
                <p className="text-accent-green text-xs font-bold uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
                    <CheckCircle2 size={12} /> On Track
                </p>
                <p className="text-white/40 text-[10px] font-medium leading-none max-w-[100px]">{aiPlan.goalName}</p>
              </div>
           </div>
           <div className="h-4 bg-white/5 rounded-full overflow-hidden p-[3px] border border-white/10">
              <div className="h-full bg-neon-gradient rounded-full shadow-[0_0_15px_rgba(163,255,18,0.3)]" style={{ width: `${percentReached}%` }} />
           </div>
           
           <div className="grid grid-cols-2 gap-3 mt-8">
              <div className="glass p-4 rounded-2xl border-white/5">
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">Calorie Deficit</p>
                <p className="text-lg font-bold">-{aiPlan.calorieDeficit} kcal</p>
              </div>
              <div className="glass p-4 rounded-2xl border-white/5">
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">Weekly Target</p>
                <p className="text-lg font-bold">~{aiPlan.weeklyWeightLoss}kg/wk</p>
              </div>
           </div>
        </div>
      </Card>

      <Card title="Macro Split" icon={PieChart} className="lg:col-span-1">
        <div className="space-y-5 mt-4">
          {macroData.map((macro) => (
            <div key={macro.name} className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold tracking-wide">
                <span className="text-white/60 uppercase">{macro.name}</span>
                <span className="text-white">{macro.value}g / <span className="text-white/30">{macro.max}g</span></span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                   className="h-full rounded-full transition-all duration-1000" 
                   style={{ width: `${(macro.value / macro.max) * 100}%`, backgroundColor: macro.color, boxShadow: `0 0 10px ${macro.color}50` }} 
                />
              </div>
            </div>
          ))}
          <div className="mt-8 p-4 glass rounded-2xl border-accent-purple/20 bg-accent-purple/5">
             <p className="text-accent-purple text-xs font-bold flex items-center gap-2 mb-1">
               <AlertCircle size={14} /> Protein Metric
             </p>
             <p className="text-white/60 text-[11px] leading-relaxed">
               Neural sync is monitoring your muscle preservation ratios.
             </p>
          </div>
        </div>
      </Card>

      {/* Middle Row */}
      <Card title="Activity Analysis" icon={Activity} className="lg:col-span-2 min-h-[350px]">
        <div className="flex justify-between items-start mb-4">
           <div>
             <span className="text-2xl font-bold">Burned: {dailyStats.burned} kcal</span>
             <p className="text-white/40 text-xs mt-1">
               {chartView === 'Day' ? 'Activity trend for today' : 
                chartView === 'Week' ? 'Daily trend in the last 7 days' : 
                'Activity trend over the last month'}
             </p>
           </div>
            <select 
               value={chartView}
               onChange={(e) => setChartView(e.target.value)}
               className="bg-white/5 border border-white/10 text-white text-xs font-bold rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-white/10 transition-colors"
            >
               <option value="Day" className="bg-[#111827] text-white">Day</option>
               <option value="Week" className="bg-[#111827] text-white">Week</option>
               <option value="Month" className="bg-[#111827] text-white">Month</option>
            </select>
        </div>
        <div className="w-full h-56 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>

              <defs>
                <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A3FF12" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#A3FF12" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#111827', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  fontSize: '12px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="calories" 
                stroke="#A3FF12" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCal)" 
                animationBegin={500}
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Food Log" icon={Clock} className="lg:col-span-1">
        <div className="flex flex-col h-full">
          <div className="relative group/list">
            <div className="space-y-4 mt-2 h-[300px] overflow-y-auto pr-2 custom-scrollbar flex-1">
              {meals.length > 0 ? meals.map((meal) => (
                <div key={meal.id} className="flex items-center justify-between p-3 rounded-2xl glass hover:bg-white/5 transition-colors cursor-pointer border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center text-accent-purple">
                      <Utensils size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{meal.name}</p>
                      <p className="text-[10px] text-white/40">{meal.time} • {meal.type}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-accent-green">+{meal.cal}</p>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center py-10">
                  <Utensils size={32} className="mb-2 text-accent-green" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Log Empty</p>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Connect your intake data above</p>
                </div>
              )}
            </div>
            {/* Subtle Gradient Fade at bottom to indicate more items */}
            {meals.length > 4 && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#161B22] to-transparent pointer-events-none z-10 opacity-60 group-hover/list:opacity-0 transition-opacity" />
            )}
          </div>
          
          <button 
            onClick={() => setIsMealModalOpen(true)}
            className="w-full py-4 rounded-2xl border border-dashed border-accent-green/30 text-accent-green/60 text-[10px] font-black uppercase tracking-widest hover:border-accent-green/60 hover:text-accent-green hover:bg-accent-green/5 transition-all mt-4"
          >
            + Log New Consumption
          </button>
        </div>
      </Card>

      {/* Bottom Row */}
      <Card title="Activity Analysis" icon={Trophy} className="md:col-span-2 lg:col-span-3">
        <div className="flex flex-col md:flex-row gap-8 items-center py-4">
           <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-accent-green text-black text-[10px] font-black uppercase tracking-wider">Status: Healthy Deficit</div>
                <div className="px-3 py-1 rounded-full bg-accent-purple/20 text-accent-purple text-[10px] font-bold uppercase tracking-wider border border-accent-purple/30">Consistency: 8/10</div>
              </div>
              <p className="text-lg font-medium leading-relaxed">
                "Based on your {dailyStats.consumed.toLocaleString()} kcal consumption and activity of {dailyStats.burned.toLocaleString()} kcal, you are currently in a <span className="text-accent-green">{(dailyStats.goal - dailyStats.consumed + dailyStats.burned).toLocaleString()} kcal balance</span>. If you maintain this for the next 4 days, you'll reach your weekly weight goal. Tip: Maintain consistent hydration for better metabolic efficiency."
              </p>

           </div>
           <div className="w-full md:w-auto flex gap-4">
               <div className="text-center px-8 py-4 glass rounded-3xl border-white/5">
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">Consistency</p>
                  <p className="text-3xl font-black text-accent-green">94%</p>
               </div>
               <div className="text-center px-8 py-4 glass rounded-3xl border-white/5">
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">Goal Streak</p>
                  <p className="text-3xl font-black text-accent-purple">12 Days</p>
               </div>
           </div>
        </div>
      </Card>

      {/* Add Meal Modal */}
      {isMealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="glass w-full max-w-lg rounded-[32px] border-white/10 overflow-hidden shadow-2xl">
              <div className="p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Log New Intake</h3>
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Neural Nutrients v1.0</p>
                    </div>
                    <button 
                      onClick={() => setIsMealModalOpen(false)}
                      className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 transition-colors"
                    >
                      <Clock className="rotate-45" size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveMeal} className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Food Item Name</label>
                       <input 
                          required
                          type="text"
                          placeholder="e.g. Avocado Toast"
                          value={mealForm.name}
                          onChange={(e) => setMealForm({...mealForm, name: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-accent-green/50 transition-all font-bold"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Calories (kcal)</label>
                          <input 
                              required
                              type="number"
                              placeholder="0"
                              value={mealForm.calories}
                              onChange={(e) => setMealForm({...mealForm, calories: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-accent-green/50 transition-all font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Protein (g)</label>
                          <input 
                              type="number"
                              placeholder="0"
                              value={mealForm.protein}
                              onChange={(e) => setMealForm({...mealForm, protein: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-accent-purple/50 transition-all font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Carbs (g)</label>
                          <input 
                              type="number"
                              placeholder="0"
                              value={mealForm.carbs}
                              onChange={(e) => setMealForm({...mealForm, carbs: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-accent-purple/50 transition-all font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Fats (g)</label>
                          <input 
                              type="number"
                              placeholder="0"
                              value={mealForm.fats}
                              onChange={(e) => setMealForm({...mealForm, fats: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-accent-purple/50 transition-all font-bold"
                          />
                        </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSavingMeal}
                      className="w-full py-5 bg-accent-green text-black font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-[0_10px_30px_rgba(163,255,18,0.2)] hover:shadow-[0_15px_40px_rgba(163,255,18,0.4)] disabled:opacity-50 mt-4"
                    >
                      {isSavingMeal ? (
                        <div className="w-6 h-6 border-4 border-black/30 border-t-black rounded-full animate-spin" />
                      ) : 'Secure Sync Consumption'}
                    </button>
                  </form>
              </div>
           </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="glass w-full max-w-lg rounded-[32px] border-white/10 overflow-hidden shadow-2xl">
              <div className="p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Adjust Targets</h3>
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Neural Sync v1.0</p>
                    </div>
                    <button 
                      onClick={() => setIsGoalModalOpen(false)}
                      className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveGoals} className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Goal Designation</label>
                       <input 
                          required
                          type="text"
                          placeholder="e.g. Muscle Building"
                          value={goalForm.goalName}
                          onChange={(e) => setGoalForm({...goalForm, goalName: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-accent-green/50 transition-all font-bold"
                       />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Daily Calorie Target (kcal)</label>
                          <input 
                              required
                              type="number"
                              placeholder="2500"
                              value={goalForm.targetCalories}
                              onChange={(e) => setGoalForm({...goalForm, targetCalories: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-accent-green/50 transition-all font-bold"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Calorie Deficit / Surplus</label>
                            <input 
                                type="number"
                                placeholder="500"
                                value={goalForm.calorieDeficit}
                                onChange={(e) => setGoalForm({...goalForm, calorieDeficit: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-accent-purple/50 transition-all font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Weekly Weight Target (kg)</label>
                            <input 
                                type="number"
                                step="0.1"
                                placeholder="0.5"
                                value={goalForm.weeklyWeightLoss}
                                onChange={(e) => setGoalForm({...goalForm, weeklyWeightLoss: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-accent-purple/50 transition-all font-bold"
                            />
                          </div>
                        </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSavingGoals}
                      className="w-full py-5 bg-accent-green text-black font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-[0_10px_30px_rgba(163,255,18,0.2)] hover:shadow-[0_15px_40px_rgba(163,255,18,0.4)] disabled:opacity-50 mt-4"
                    >
                      {isSavingGoals ? (
                        <div className="w-6 h-6 border-4 border-black/30 border-t-black rounded-full animate-spin" />
                      ) : 'Confirm Neural Targets'}
                    </button>
                  </form>
              </div>
           </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default Dashboard;



