"use client";

import { Award, Sprout, Calendar, Bug, BookOpen, Sparkles, ChevronDown, CheckCircle2, Leaf, Shield } from 'lucide-react';
import { useState } from 'react';

const guides = {
  Papaya: {
    icon: "🥭",
    description: "Sourced from high-yielding, virus-resistant nursery saplings grown on raised beds with drip irrigation in sunny Jaipur blocks.",
    steps: [
      { name: 'Nursery sapling selection', desc: 'Carefully choosing healthy 45-day-old saplings free from viral leaf curls.' },
      { name: 'Raised bed planting', desc: 'Preparing 2-foot raised beds with lateral drip lines to prevent soil saturation.' },
      { name: 'Neem cake soil prep', desc: 'Mixing organic neem cake and vermicompost to enrich soil microbiology naturally.' },
      { name: 'Drip irrigation', desc: 'Delivering micro-doses of mineralized water directly to root zones daily.' },
      { name: 'Fruit thinning', desc: 'Removing congested fruit clusters to allow remaining papayas to size up beautifully.' },
      { name: 'Harvest sorting', desc: 'Handpicking fruits at first yellow-blush stage and grade sorting by weight.' }
    ],
    pests: [
      { bug: 'Mealybug', solution: 'Organic neem oil spray & biological soap treatment' },
      { bug: 'Fruit fly', solution: 'Installing methyl eugenol pheromone sticky traps' },
      { bug: 'Root rot', solution: 'Inoculating soil beds with Trichoderma compost' }
    ],
    recipes: [
      { name: 'Jeevamrit soil tonic', prep: 'Mix cow dung, urine, jaggery, chickpea flour, and forest soil. Ferment for 7 days. Dilute 1:10 and apply to roots to double microbial activity.' },
      { name: 'Garlic-chilli pest spray', prep: 'Grind 500g garlic and 500g hot green chillies into a paste. Extract juice, dilute with water and soap nut extract, spray for sucking pests.' },
      { name: 'Compost tea foliar feed', prep: 'Steep mature vermicompost in aerated water for 24 hours. Spray leaves to build a natural microbial shield against fungal spores.' }
    ]
  },
  Mango: {
    icon: "🥭",
    description: "Grafted Kesar and Dasheri varieties nurtured with organic mulching and canopy pruning to maximize sun penetration and natural sweetness.",
    steps: [
      { name: 'Grafted sapling care', desc: 'Protecting the graft union area while pruning rootstock suckers regularly.' },
      { name: 'Basin mulching', desc: 'Applying dense layer of dry organic straw around root basin to preserve soil moisture.' },
      { name: 'Canopy pruning', desc: 'Opening the center of the tree to secure optimal sunlight exposure and airflow.' },
      { name: 'Flower protection', desc: 'Applying wood ash sprays during winter flowering to guard delicate inflorescences.' },
      { name: 'Fruit bagging', desc: 'Wrapping maturing mangoes in organic paper bags to protect against pest scarring.' },
      { name: 'Ripeness grading', desc: 'Floating tests and harvesting at mature green stage followed by straw ripening.' }
    ],
    pests: [
      { bug: 'Hopper', solution: 'Yellow sticky traps & neem-based oil sprays' },
      { bug: 'Powdery mildew', solution: 'Wettable sulfur dusting or organic buttermilk sprays' },
      { bug: 'Stem borer', solution: 'Pruning infested twigs and inserting neem oil plugs' }
    ],
    recipes: [
      { name: 'Panchagavya spray', prep: 'Blend cow dung, urine, milk, curd, and ghee. Add tender coconut water, banana pulp, and ferment for 21 days. Dilute at 3% for foliar spray.' },
      { name: 'Wood ash mineral mix', prep: 'Sift pure hardwood ash. Dust over foliage in the early morning dew to deliver potash minerals and prevent leaf hopper infestation.' },
      { name: 'Buttermilk fungal control', prep: 'Allow fresh sour buttermilk to ferment for 4 days. Mix with copper/wood ash, dilute 1:10, and spray to cure early mildew outbreaks.' }
    ]
  }
};

export default function HowWeGrowPage() {
  const [activeTab, setActiveTab] = useState<'Papaya' | 'Mango'>('Papaya');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  const guide = guides[activeTab];

  return (
    <main className="min-h-screen bg-[#f8fbf5] pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-grove-900 via-grove-800 to-ink py-16 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-grove-500/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-marigold/10 border border-marigold/30 px-3 py-1 text-xs font-bold text-marigold uppercase tracking-wider">
                <Sparkles size={13} className="animate-pulse" /> PGS-India Certified Practices
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">How we grow</h1>
              <p className="max-w-2xl text-grove-100 text-sm md:text-base leading-relaxed">
                Discover the direct farm operations, Vedic organic formulas, and pest strategies we use in Rajasthan to cultivate your delicious fruits.
              </p>
            </div>
            <div className="flex bg-ink/40 border border-white/10 p-1.5 rounded-xl backdrop-blur shrink-0 max-w-xs shadow-soft">
              {(['Papaya', 'Mango'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setExpandedRecipe(null);
                  }}
                  className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-grove-700 text-white shadow-md scale-[1.02]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab === 'Papaya' ? '🌱' : '🥭'} {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="mx-auto max-w-7xl px-4 mt-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column: Growth Steps */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-grove-100 bg-white p-6 md:p-8 shadow-soft">
              <div className="flex items-center gap-3 border-b border-grove-50 pb-5 mb-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-grove-50 text-grove-700">
                  <Sprout size={20} />
                </span>
                <div>
                  <h2 className="text-2xl font-black text-ink">{activeTab} cultivation lifecycle</h2>
                  <p className="text-xs text-ink/65 mt-0.5">{guide.description}</p>
                </div>
              </div>

              {/* Steps timeline */}
              <div className="relative space-y-6 pl-4 border-l border-grove-100 ml-4 py-2">
                {guide.steps.map((step, index) => (
                  <div key={step.name} className="relative group">
                    {/* Circle Node */}
                    <div className="absolute -left-[30px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-grove-100 group-hover:border-grove-700 transition">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-grove-50 text-xs font-black text-grove-700 group-hover:bg-grove-700 group-hover:text-white transition">
                        {index + 1}
                      </span>
                    </div>
                    {/* Card Content */}
                    <div className="bg-grove-50/50 hover:bg-grove-50 border border-transparent hover:border-grove-100/50 rounded-xl p-4 transition-all duration-300 ml-2">
                      <h3 className="font-bold text-ink text-base flex items-center gap-2">
                        {step.name}
                        <CheckCircle2 size={15} className="text-grove-500 opacity-0 group-hover:opacity-100 transition duration-300" />
                      </h3>
                      <p className="text-sm text-ink/75 mt-1 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Recipes, Calendar & Pests */}
          <div className="space-y-6">
            {/* Tab 1: DIY Recipes */}
            <div className="rounded-2xl border border-grove-100 bg-white p-6 shadow-soft">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-grove-50 text-grove-700">
                  <BookOpen size={18} />
                </span>
                <h3 className="font-black text-lg text-ink">DIY Organic Recipes</h3>
              </div>
              <div className="space-y-3">
                {guide.recipes.map((recipe) => {
                  const isExpanded = expandedRecipe === recipe.name;
                  return (
                    <div
                      key={recipe.name}
                      className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                        isExpanded ? 'border-grove-200 bg-grove-50/20' : 'border-grove-100 hover:border-grove-200'
                      }`}
                    >
                      <button
                        onClick={() => setExpandedRecipe(isExpanded ? null : recipe.name)}
                        className="flex w-full cursor-pointer items-center justify-between p-4 text-left font-bold text-ink"
                      >
                        <span className="flex items-center gap-2 text-sm">
                          <Leaf size={15} className="text-grove-600" /> {recipe.name}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`text-grove-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <div
                        className={`transition-all duration-300 ${
                          isExpanded ? 'max-h-48 border-t border-grove-50 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                        }`}
                      >
                        <p className="p-4 text-xs leading-relaxed text-ink/75">
                          {recipe.prep}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tab 2: Seasonal Calendar */}
            <div className="rounded-2xl border border-grove-100 bg-white p-6 shadow-soft">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-grove-50 text-grove-700">
                  <Calendar size={18} />
                </span>
                <h3 className="font-black text-lg text-ink">Seasonal Operations</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                {[
                  { range: 'Jan - Mar', desc: 'Pruning & ashes' },
                  { range: 'Apr - Jun', desc: 'Drip & bag setup' },
                  { range: 'Jul - Sep', desc: 'Harvest & compost' },
                  { range: 'Oct - Dec', desc: 'Bed prep & mulching' }
                ].map((item) => (
                  <div key={item.range} className="rounded-xl bg-grove-50/70 p-3 hover:bg-grove-50 transition border border-transparent hover:border-grove-100/50">
                    <p className="font-bold text-grove-800">{item.range}</p>
                    <p className="text-[10px] text-ink/60 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tab 3: Pest Library */}
            <div className="rounded-2xl border border-grove-100 bg-white p-6 shadow-soft">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-grove-50 text-grove-700">
                  <Bug size={18} />
                </span>
                <h3 className="font-black text-lg text-ink">Biological Pest Control</h3>
              </div>
              <div className="overflow-hidden border border-grove-100 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-grove-50 text-grove-800 font-bold border-b border-grove-100">
                      <th className="py-2.5 px-3">Pest / Disease</th>
                      <th className="py-2.5 px-3">Certified Defense</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-grove-50">
                    {guide.pests.map((pest) => (
                      <tr key={pest.bug} className="hover:bg-grove-50/20 transition">
                        <td className="py-2.5 px-3 font-semibold text-ink flex items-center gap-1.5">
                          <Shield size={12} className="text-marigold" /> {pest.bug}
                        </td>
                        <td className="py-2.5 px-3 text-ink/75">{pest.solution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
