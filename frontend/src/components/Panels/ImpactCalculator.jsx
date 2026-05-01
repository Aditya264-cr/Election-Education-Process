import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { useKidsMode } from '../../hooks/useKidsMode';
import { ListenButton } from '../../hooks/useTextToSpeech';
import Icon from '../DesignSystem/Atoms/Icon';
import './ImpactCalculator.css';

const INFRASTRUCTURE_PROJECTS = {
  "Mumbai North": [
    { title: "Coastal Road Phase 2", cost: "₹1,200 Cr", status: "Active", type: "road" },
    { title: "Borivali Station Upgrade", cost: "₹450 Cr", status: "Planned", type: "station" },
  ],
  "Pune": [
    { title: "Metro Line 3", cost: "₹8,300 Cr", status: "Active", type: "train" },
    { title: "Riverside Garden Path", cost: "₹120 Cr", status: "Completed", type: "park" },
  ],
  "New Delhi": [
    { title: "Electric Bus Depots", cost: "₹600 Cr", status: "Active", type: "bus" },
    { title: "Primary School Renovations", cost: "₹200 Cr", status: "Ongoing", type: "school" },
  ]
};

const DEFAULT_PROJECTS = [
  { title: "Local Road Resurfacing", cost: "₹50 Cr", status: "Ongoing", type: "road" },
  { title: "Neighborhood Smart Lighting", cost: "₹15 Cr", status: "Completed", type: "light" },
];

export default function ImpactCalculator({ constituency, onClose }) {
  const { t, lang } = useLanguage();
  const { isKidsMode } = useKidsMode();
  const [hasVoted, setVoted] = useState(false);
  
  // Slide-to-vote state
  const x = useMotionValue(0);
  const background = useTransform(x, [0, 200], ["rgba(59, 130, 246, 0.1)", "rgba(16, 185, 129, 0.3)"]);
  const opacity = useTransform(x, [0, 180, 200], [1, 1, 0]);

  if (!constituency) return null;

  const projects = INFRASTRUCTURE_PROJECTS[constituency.pc_name] || DEFAULT_PROJECTS;
  const impactText = `Your vote in ${constituency.pc_name} helps decide the priority for projects like ${projects[0].title}. Slide your vote into the box to see your tax contribution in action!`;

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 150) {
      setVoted(true);
    }
  };

  return (
    <div className="impact-simulator space-y-8 p-1">
      <header className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Icon name="Zap" size={28} className="text-amber-500" />
          Hyper-Local Impact
          <ListenButton text={impactText} lang={lang} />
        </h2>
        <p className="text-slate-600 font-medium">
          See how tax dollars in your specific street are impacted by this election.
        </p>
      </header>

      <AnimatePresence mode="wait">
        {!hasVoted ? (
          <motion.div 
            key="voter-slider"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-8 text-center space-y-6"
          >
            <div className="mx-auto w-20 h-20 bg-white shadow-lg rounded-2xl flex items-center justify-center text-blue-600 mb-4">
              <Icon name="Fingerprint" size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Your Vote, Your Street</h3>
              <p className="text-sm text-slate-500 px-4">Slide the "Power Stone" to authorize your civic contribution.</p>
            </div>

            <div className="relative h-20 bg-slate-200 rounded-full p-2 flex items-center overflow-hidden">
              <motion.div 
                className="absolute inset-0 z-0 pointer-events-none"
                style={{ background }}
              />
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 200 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className="z-10 w-16 h-16 bg-white shadow-xl rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing"
              >
                <Icon name="ChevronRight" className="text-blue-600" />
              </motion.div>
              <motion.div 
                style={{ opacity }}
                className="flex-1 text-slate-400 font-black text-xs uppercase tracking-widest text-right pr-8"
              >
                Slide to Empower 
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="impact-results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex gap-4">
              <div className="p-3 bg-emerald-100 rounded-2xl h-fit text-emerald-600">
                <Icon name="ShieldCheck" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-emerald-900">Vote Authenticated</h3>
                <p className="text-sm text-emerald-700 leading-relaxed">
                  In {constituency.pc_name}, your vote directly monitors the <strong>{projects.length} key projects</strong> listed below. 
                  Every ₹100 of local tax is allocated through this democratic oversight.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Street-Level ROI Projects</h4>
              <div className="grid gap-3">
                {projects.map((p, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex justify-between items-center"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                        <Icon name={p.type === 'road' ? 'Truck' : p.type === 'school' ? 'GraduationCap' : 'Hammer'} size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{p.title}</p>
                        <p className="text-xs text-slate-500">{p.cost} Investment</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase">
                      {p.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-4 text-center">
               <p className="text-sm font-medium opacity-80 italic">"The ROI of your vote is measured in the quality of your commute, the light on your street, and the strength of your local schools."</p>
               <div className="pt-4 border-t border-white/10 flex justify-center gap-6">
                 <div className="text-center">
                   <p className="text-2xl font-black">{constituency.turnout_2024}%</p>
                   <p className="text-[10px] font-bold uppercase opacity-50">Local Power</p>
                 </div>
                 <div className="text-center">
                   <p className="text-2xl font-black">₹{projects.length * 400}Cr+</p>
                   <p className="text-[10px] font-bold uppercase opacity-50">Active Budget</p>
                 </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
