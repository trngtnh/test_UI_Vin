'use client';

import React from 'react';
import { AgentCopilotPane } from '@/components/studio/AgentCopilotPane';
import { LivingCanvasPane } from '@/components/studio/LivingCanvasPane';

export const CustomerWorkspace: React.FC = () => {
  return (
    <div className="flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-3 sm:px-6 py-3 flex flex-col h-full overflow-hidden">
      {/* AI-FIRST DECISION STUDIO: DUAL-PANE LAYOUT */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-4 h-full overflow-hidden">
        {/* LEFT PANE: AGENT COPILOT (FIXED / STATIONARY, NEVER SCROLLS WITH PAGE) */}
        <div className="w-full md:w-[380px] lg:w-[410px] xl:w-[430px] shrink-0 h-full overflow-hidden flex flex-col">
          <AgentCopilotPane />
        </div>

        {/* RIGHT PANE: GENERATIVE LIVING CANVAS (INDEPENDENT INTERNAL SCROLLING) */}
        <div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col">
          <LivingCanvasPane />
        </div>
      </div>
    </div>
  );
};
