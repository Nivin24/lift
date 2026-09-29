import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface CardStatusDropdownProps {
  status: string;
  onStatusChange: (newStatus: string) => void;
  direction?: 'up' | 'down';
}

export const CardStatusDropdown: React.FC<CardStatusDropdownProps> = ({
  status,
  onStatusChange,
  direction = 'up',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDone = status === 'COMPLETED';
  const isInProg = status === 'IN_PROGRESS';

  const positionClasses =
    direction === 'down'
      ? 'top-full mt-1.5'
      : 'bottom-full mb-1.5';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center space-x-1.5 text-xs font-mono font-semibold px-3 py-1.5 rounded-full border transition-all shadow-xs ${
          isDone
            ? 'bg-[#CDE9D6] dark:bg-[#143E23] text-[#19522F] dark:text-[#A3E8B5] border-[#B7DDC3] dark:border-[#1E5C35]'
            : isInProg
            ? 'bg-[#FCE8A6] dark:bg-[#4E3800] text-[#634800] dark:text-[#FCE8A6] border-[#E8D494] dark:border-[#6B4E00]'
            : 'bg-[#F0F1EC] dark:bg-[#202422] text-[#525752] dark:text-[#A3AAA4] border-[#E3E5DE] dark:border-[#2E3330] hover:border-[#161917] dark:hover:border-white'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isDone ? 'bg-emerald-600 dark:bg-emerald-400' : isInProg ? 'bg-amber-600 dark:bg-amber-400' : 'bg-neutral-400'
          }`}
        />
        <span>{isInProg ? 'IN PROGRESS' : status}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 ${positionClasses} w-40 bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-2xl p-1.5 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-100`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange('TODO');
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-mono font-semibold hover:bg-[#F0F1EC] dark:hover:bg-[#222624] text-[#161917] dark:text-white transition-colors"
          >
            <span>TODO</span>
            {status === 'TODO' && <Check className="w-3.5 h-3.5 text-[#161917] dark:text-white" />}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange('IN_PROGRESS');
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-mono font-semibold hover:bg-[#F0F1EC] dark:hover:bg-[#222624] text-[#634800] dark:text-[#FCE8A6] transition-colors"
          >
            <span>IN PROGRESS</span>
            {status === 'IN_PROGRESS' && <Check className="w-3.5 h-3.5 text-[#634800] dark:text-[#FCE8A6]" />}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange('COMPLETED');
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-mono font-semibold hover:bg-[#F0F1EC] dark:hover:bg-[#222624] text-[#19522F] dark:text-[#A3E8B5] transition-colors"
          >
            <span>COMPLETED</span>
            {status === 'COMPLETED' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
          </button>
        </div>
      )}
    </div>
  );
};
