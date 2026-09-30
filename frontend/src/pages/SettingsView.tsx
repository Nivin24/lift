import React, { useState, useEffect } from 'react';
import { AISettings } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Sliders,
  Key,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Lock,
  RotateCw,
  Server,
  User as UserIcon,
  Trash2,
} from 'lucide-react';

interface SettingsViewProps {
  onRefreshGlobal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onRefreshGlobal }) => {
  const { user } = useAuth();
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      const data = await api.getAISettings();
      setAiSettings(data);
      if (data.model_name) {
        setSelectedModel(data.model_name);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [user?.id]);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const keyToTest = apiKeyInput.trim() || undefined;
      const res = await api.testAIConnection(keyToTest, selectedModel);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim() && !aiSettings?.is_configured) {
      alert('Please enter a Gemini API Key');
      return;
    }

    setSaving(true);
    setSaveMessage(null);
    try {
      const keyToSave = apiKeyInput.trim();
      const updated = await api.saveAISettings(keyToSave, selectedModel);
      setAiSettings(updated);
      setApiKeyInput('');
      setSaveMessage('Credentials encrypted and saved successfully at rest.');
      if (onRefreshGlobal) onRefreshGlobal();
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveKey = async () => {
    if (!confirm('Are you sure you want to remove your saved Gemini credentials?')) return;
    try {
      await api.request('/settings/ai', { method: 'DELETE' });
      loadSettings();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#161917] tracking-tight flex items-center space-x-2">
          <Sliders className="w-6 h-6 text-[#161917]" />
          <span>Platform Settings & BYOK</span>
        </h1>
        <p className="text-xs text-[#6B7280] font-mono mt-1">
          Bring Your Own Key (BYOK) architecture for Google Gemini content generation.
        </p>
      </div>

      {/* AI Provider Configuration Card */}
      <div className="bg-white border border-[#E5E6DF] rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#E5E6DF] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-[#D4E2F8] text-[#1E3A68]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#161917]">Gemini BYOK Configuration</h2>
              <p className="text-xs text-[#6B7280] font-mono">
                Encrypted at rest • Never logged • Zero client credential leaks
              </p>
            </div>
          </div>

          <div className="text-right">
            {aiSettings?.is_configured ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#CDE9D6] text-[#19522F] text-xs font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Configured ({aiSettings.masked_key})</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FDD7AE] text-[#7A3E00] text-xs font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Key Required</span>
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Provider Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                AI Provider
              </label>
              <select
                disabled
                className="w-full bg-[#F0F1EC] border border-[#E5E6DF] rounded-2xl text-xs font-mono px-3.5 py-2.5 text-[#161917]"
              >
                <option value="gemini">Google Gemini (Active)</option>
                <option value="openai" disabled>OpenAI (Future V2)</option>
                <option value="claude" disabled>Anthropic Claude (Future V2)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                Target Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-[#F0F1EC] border border-[#E5E6DF] rounded-2xl text-xs font-mono px-3.5 py-2.5 text-[#161917] focus:outline-none focus:border-[#161917]"
              >
                {aiSettings?.available_models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Gemini API Key
              </label>
              {aiSettings?.is_configured && (
                <span className="text-[11px] font-mono text-[#6B7280]">
                  Current key: {aiSettings.masked_key}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder={
                  aiSettings?.is_configured
                    ? 'Enter new key to replace existing saved key...'
                    : 'AIzaSy...'
                }
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full bg-[#F0F1EC] border border-[#E5E6DF] rounded-2xl text-xs font-mono px-3.5 py-2.5 text-[#161917] placeholder-[#6B7280] focus:outline-none focus:border-[#161917]"
              />
            </div>
          </div>

          {/* Test & Save Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection || (!apiKeyInput.trim() && !aiSettings?.is_configured)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-white border border-[#E5E6DF] hover:bg-[#E5E6DF] text-xs font-semibold text-[#161917] transition-colors disabled:opacity-40 shadow-sm"
              >
                {testingConnection ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Server className="w-3.5 h-3.5" />
                    <span>Test Connection</span>
                  </>
                )}
              </button>

              {aiSettings?.is_configured && (
                <button
                  type="button"
                  onClick={handleRemoveKey}
                  className="flex items-center space-x-1 px-4 py-2 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Key</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={saving || (!apiKeyInput.trim() && !aiSettings?.is_configured)}
              className="flex items-center space-x-1.5 px-6 py-2.5 bg-[#161917] hover:bg-black text-white rounded-full text-xs font-semibold transition-colors shadow-sm disabled:opacity-40"
            >
              <span>{saving ? 'Encrypting & Saving...' : 'Save Configuration'}</span>
            </button>
          </div>

          {/* Test Result Callout */}
          {testResult && (
            <div
              className={`p-4 rounded-2xl border text-xs font-mono flex items-start space-x-2.5 ${
                testResult.success
                  ? 'bg-[#CDE9D6] border-[#B7DDC3] text-[#19522F]'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-[#19522F] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">{testResult.success ? 'Success' : 'Connection Error'}</p>
                <p className="text-[11px] mt-0.5">{testResult.message}</p>
              </div>
            </div>
          )}

          {saveMessage && (
            <div className="p-4 rounded-2xl bg-[#CDE9D6] border border-[#B7DDC3] text-xs font-semibold text-[#19522F] flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-[#19522F]" />
              <span>{saveMessage}</span>
            </div>
          )}
        </form>
      </div>

      {/* Security Principles Architecture Card */}
      <div className="bg-white border border-[#E5E6DF] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Security Architecture & Encryption Specifications</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#F0F1EC] border border-[#E5E6DF] space-y-1">
            <span className="text-[#161917] font-bold">1. Zero Plaintext</span>
            <p className="text-[11px] text-[#6B7280]">
              API keys are encrypted using Fernet (AES-128-CBC + HMAC-SHA256) before entering the database.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F0F1EC] border border-[#E5E6DF] space-y-1">
            <span className="text-[#161917] font-bold">2. External Secret</span>
            <p className="text-[11px] text-[#6B7280]">
              The master encryption secret is isolated in environment variables outside the database.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F0F1EC] border border-[#E5E6DF] space-y-1">
            <span className="text-[#161917] font-bold">3. Zero Client Leaks</span>
            <p className="text-[11px] text-[#6B7280]">
              The backend returns only masked strings (e.g. ••••••••1234). Decryption occurs exclusively in server memory.
            </p>
          </div>
        </div>
      </div>

      {/* Active User Account Details */}
      <div className="bg-white border border-[#E5E6DF] rounded-3xl p-6 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
          <UserIcon className="w-4 h-4 text-[#161917]" />
          <span>Account Profile</span>
        </div>
        <div className="flex items-center justify-between text-xs bg-[#F0F1EC] p-4 rounded-2xl border border-[#E5E6DF]">
          <div>
            <p className="text-[#161917] font-bold">{user?.full_name} ({user?.username})</p>
            <p className="text-[#6B7280] text-[11px] font-mono">{user?.email}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#161917] text-white text-[11px] font-semibold">
            ACTIVE SESSION
          </span>
        </div>
      </div>
    </div>
  );
};
