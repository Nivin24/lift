import React, { useState } from 'react';
import {
  Sparkles,
  X,
  CheckCircle,
  AlertCircle,
  Save,
  BookOpen,
  HelpCircle,
  CheckSquare,
  ListTodo,
  FileText,
  RotateCw,
} from 'lucide-react';
import { api } from '../services/api';

interface AIGeneratorModalProps {
  topicId: number;
  topicTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  onOpenSettings: () => void;
}

type GenType = 'material' | 'questions' | 'quiz' | 'task' | 'revision';

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  topicId,
  topicTitle,
  isOpen,
  onClose,
  onSaved,
  onOpenSettings,
}) => {
  const [activeType, setActiveType] = useState<GenType>('material');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setPreviewData(null);
    setSaveSuccess(false);

    try {
      const res = await api.generateContent(topicId, activeType, customPrompt);
      setPreviewData(res);
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!previewData) return;
    setLoading(true);
    setError(null);

    try {
      const title = `${topicTitle}: ${activeType.toUpperCase()}`;
      const questions = previewData.structured_content?.questions || previewData.structured_content?.quiz;
      const tasks = previewData.structured_content?.practical_tasks
        ? previewData.structured_content.practical_tasks.map((t: any) => ({
            title: t.title,
            description: t.description,
            task_type: t.type || 'CODING',
            priority: 'HIGH',
            is_required: true,
          }))
        : previewData.generation_type === 'task'
        ? [
            {
              title: previewData.structured_content.title || `${topicTitle} Task`,
              description: previewData.structured_content.description,
              task_type: previewData.structured_content.task_type || 'PRACTICE',
              priority: 'HIGH',
              is_required: true,
            },
          ]
        : undefined;

      await api.saveAIGeneration(
        topicId,
        activeType,
        title,
        previewData.markdown_content,
        questions,
        tasks
      );
      setSaveSuccess(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save generated content.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-workspace-panel border border-workspace-border rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-workspace-border flex items-center justify-between bg-workspace-card/50">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">AI Content Generation</h2>
              <p className="text-xs text-slate-400 font-mono">Topic: {topicTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-workspace-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Type Selector */}
        <div className="p-4 border-b border-workspace-border bg-workspace-bg/50">
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            Select Generation Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              onClick={() => { setActiveType('material'); setPreviewData(null); }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                activeType === 'material'
                  ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                  : 'border-workspace-border text-slate-400 hover:text-white hover:bg-workspace-hover'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Full Material</span>
            </button>

            <button
              onClick={() => { setActiveType('questions'); setPreviewData(null); }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                activeType === 'questions'
                  ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                  : 'border-workspace-border text-slate-400 hover:text-white hover:bg-workspace-hover'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Questions</span>
            </button>

            <button
              onClick={() => { setActiveType('quiz'); setPreviewData(null); }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                activeType === 'quiz'
                  ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                  : 'border-workspace-border text-slate-400 hover:text-white hover:bg-workspace-hover'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Quiz (MCQ)</span>
            </button>

            <button
              onClick={() => { setActiveType('task'); setPreviewData(null); }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                activeType === 'task'
                  ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                  : 'border-workspace-border text-slate-400 hover:text-white hover:bg-workspace-hover'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Practice Task</span>
            </button>

            <button
              onClick={() => { setActiveType('revision'); setPreviewData(null); }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                activeType === 'revision'
                  ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                  : 'border-workspace-border text-slate-400 hover:text-white hover:bg-workspace-hover'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Revision Notes</span>
            </button>
          </div>

          {/* Optional Prompt Refinement */}
          <div className="mt-3 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Optional instruction (e.g. 'Focus on edge cases and latency bottlenecks')..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="flex-1 bg-workspace-card border border-workspace-border text-xs px-3 py-2 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white rounded-md text-xs font-medium shadow-md transition-all shrink-0 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Content</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mx-4 mt-4 p-3 rounded-lg bg-red-950/50 border border-red-800 text-xs text-red-300 flex items-start justify-between">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">AI Generation Issue</p>
                <p className="font-mono text-[11px] mt-0.5">{error}</p>
              </div>
            </div>
            {error.toLowerCase().includes('api key') && (
              <button
                onClick={onOpenSettings}
                className="px-2.5 py-1 bg-red-900/60 hover:bg-red-800 text-white rounded text-[11px] font-mono shrink-0 ml-3"
              >
                Open Settings
              </button>
            )}
          </div>
        )}

        {/* Content Preview & Review Area */}
        <div className="flex-1 overflow-y-auto p-4 font-sans text-xs">
          {previewData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-workspace-card px-3 py-2 rounded border border-workspace-border">
                <span className="font-mono text-slate-400 uppercase text-[11px]">
                  Status: <span className="text-amber-400">Preview Only (Unsaved)</span>
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  Adheres to LIFT 14-Section Curriculum Schema
                </span>
              </div>

              <div className="bg-workspace-bg p-5 rounded-lg border border-workspace-border whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-slate-200 selection:bg-sky-900">
                {previewData.markdown_content}
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Sparkles className="w-8 h-8 text-purple-400/40" />
              <p className="font-mono text-xs">Click "Generate Content" to draft structured curriculum material.</p>
              <p className="text-[11px] text-slate-400">Content will be shown here for review before saving.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {previewData && (
          <div className="p-4 border-t border-workspace-border bg-workspace-card flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Review before saving. This will add new study resources without overwriting existing notes.
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewData(null)}
                className="px-3 py-1.5 rounded-md border border-workspace-border text-xs text-slate-400 hover:text-white hover:bg-workspace-hover transition-colors"
              >
                Discard
              </button>

              <button
                onClick={handleSave}
                disabled={loading || saveSuccess}
                className="flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save to Curriculum</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
