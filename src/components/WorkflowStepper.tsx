import { CheckCircle2, ChevronRight, FileText, Filter, GitCompare, Lock, Search } from 'lucide-react';
import type { AMRIsolate } from '../types/amr';

interface WorkflowStepperProps {
  activeStep: 1 | 2 | 3 | 4;
  onStepChange: (step: 1 | 2 | 3 | 4) => void;
  isolateA: AMRIsolate | null;
  isolateB: AMRIsolate | null;
}

const STEPS = [
  { id: 1 as const, title: '1. Choose & Filter Bacteria', shortTitle: '1. Choose', icon: Filter },
  { id: 2 as const, title: '2. Explore Resistance Evidence', shortTitle: '2. Explore', icon: Search },
  { id: 3 as const, title: '3. Compare Bacteria', shortTitle: '3. Compare', icon: GitCompare },
  { id: 4 as const, title: '4. Create & Export Report', shortTitle: '4. Report', icon: FileText },
];

export function WorkflowStepper({
  activeStep,
  onStepChange,
  isolateA,
  isolateB,
}: WorkflowStepperProps) {
  const isPairSelected = Boolean(isolateA && isolateB && isolateA.isolate_id !== isolateB.isolate_id);

  return (
    <nav aria-label="Workflow progress" className="bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center justify-between sm:justify-start gap-1 sm:gap-4 py-3 overflow-x-auto">
          {STEPS.map((step, idx) => {
            const isActive = activeStep === step.id;
            const isLocked = step.id > 1 && !isPairSelected;
            const isCompleted = isPairSelected && activeStep > step.id;
            const Icon = step.icon;

            return (
              <li key={step.id} className="flex items-center gap-1 sm:gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => !isLocked && onStepChange(step.id)}
                  disabled={isLocked}
                  aria-current={isActive ? 'step' : undefined}
                  title={isLocked ? 'Select 2 isolates in Step 1 to unlock' : `Go to Step ${step.id}`}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : isLocked
                      ? 'text-slate-400 bg-slate-50 cursor-not-allowed opacity-75'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span className="hidden md:inline">{step.title}</span>
                    <span className="inline md:hidden">{step.shortTitle}</span>
                  </div>

                  {isLocked && (
                    <span className="hidden xl:inline text-[10px] text-slate-400 font-normal">
                      (Select 2 isolates)
                    </span>
                  )}
                </button>

                {idx < STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 hidden sm:block" />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
