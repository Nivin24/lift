import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MobileApi, MobileTopicSummary, MobileTopicDetail, MobileUser } from './src/services/api';
import { DashboardOverview, Task, LearningAreaProgress, AnalyticsOverview } from './src/types';

const logoDark = require('./assets/logo-dark.png');
const logoLight = require('./assets/logo-light.png');

function MainScreen() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [currentUser, setCurrentUser] = useState<MobileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bottom navigation tabs: Home | Learn | Tasks | TOI | Progress
  const [activeTab, setActiveTab] = useState<'Home' | 'Learn' | 'Tasks' | 'TOI' | 'Progress'>('Home');

  // Drill-down states
  const [selectedArea, setSelectedArea] = useState<LearningAreaProgress | null>(null);
  const [areaTopics, setAreaTopics] = useState<MobileTopicSummary[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const [selectedTopic, setSelectedTopic] = useState<MobileTopicDetail | null>(null);
  const [loadingTopicDetail, setLoadingTopicDetail] = useState(false);
  const [showAnswer, setShowAnswer] = useState<Record<number, boolean>>({});

  // Tasks Focus State
  const [focusedTask, setFocusedTask] = useState<Task | null>(null);
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'TODO' | 'COMPLETED'>('ALL');
  const [allTasksList, setAllTasksList] = useState<Task[]>([]);
  const [focusedTaskQuestions, setFocusedTaskQuestions] = useState<Array<{ id: number; question_text: string; answer_text?: string; question_type: string; difficulty: string }>>([]);

  // Theme state: dark (default matching web workspace) | light
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const isDark = theme === 'dark';

  // App Logo Theme Switcher: 'auto' (tracks dark/light) | 'dark' (Onyx) | 'light' (Alabaster Glass)
  const [logoTheme, setLogoTheme] = useState<'auto' | 'dark' | 'light'>('auto');
  const activeLogo =
    logoTheme === 'dark'
      ? logoDark
      : logoTheme === 'light'
      ? logoLight
      : isDark
      ? logoDark
      : logoLight;

  // Center Home Quick Actions Dock state
  const [quickHubVisible, setQuickHubVisible] = useState(false);

  // In-Island Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Self-Analytics & Pacing State
  const [analyticsData, setAnalyticsData] = useState<AnalyticsOverview | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [pacingDays, setPacingDays] = useState<number>(7);

  // Profile & Settings Modal state
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Gemini BYOK state in modal
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const loadAnalytics = async (days: number = pacingDays) => {
    setAnalyticsLoading(true);
    try {
      const an = await MobileApi.getAnalytics(days);
      setAnalyticsData(an);
    } catch (e: any) {
      console.error('Error loading analytics:', e);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadDashboard = async () => {
    try {
      const me = await MobileApi.getMe().catch(() => null);
      if (!me) {
        const loginRes = await MobileApi.login('user1', 'password123');
        setCurrentUser(loginRes.user);
      } else {
        setCurrentUser(me);
      }

      const [dash, tasks, an] = await Promise.all([
        MobileApi.getDashboard(),
        MobileApi.getAllTasks().catch(() => []),
        MobileApi.getAnalytics(pacingDays).catch(() => null),
      ]);
      setData(dash);
      setAllTasksList(tasks);
      if (an) setAnalyticsData(an);
    } catch (e: any) {
      console.error('Error loading mobile data:', e);
      setError(e.message || 'Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Quick switch between demo users
  const handleQuickSwitchUser = async (username: string) => {
    setLoading(true);
    setProfileModalVisible(false);
    try {
      const res = await MobileApi.login(username, 'password123');
      setCurrentUser(res.user);
      await loadDashboard();
      Alert.alert('User Switched', `Logged in as ${res.user.full_name || res.user.username}`);
    } catch (e: any) {
      Alert.alert('Login Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // Custom email and password login or registration
  const handleCustomAuth = async () => {
    if (!customEmail.trim() || !customPassword.trim()) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }
    setAuthSubmitting(true);
    try {
      const res = await MobileApi.loginOrRegister(customEmail, customPassword, isRegisterMode);
      setCurrentUser(res.user);
      setCustomEmail('');
      setCustomPassword('');
      setProfileModalVisible(false);
      await loadDashboard();
      Alert.alert('Welcome', `Signed in successfully as ${res.user.email}`);
    } catch (e: any) {
      Alert.alert('Authentication Failed', e.message || 'Check email and password.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Test BYOK key
  const handleTestKey = async () => {
    setTestingKey(true);
    setTestResult(null);
    try {
      const res = await MobileApi.testAIConnection(apiKeyInput || undefined, selectedModel);
      setTestResult(res.success ? '✓ Connected to Gemini!' : `✗ ${res.message}`);
    } catch (e: any) {
      setTestResult(`✗ ${e.message}`);
    } finally {
      setTestingKey(false);
    }
  };

  // Save BYOK key
  const handleSaveKey = async () => {
    if (!apiKeyInput.trim()) {
      Alert.alert('Input Required', 'Please enter a Gemini API Key to save.');
      return;
    }
    try {
      await MobileApi.saveAISettings(apiKeyInput.trim(), selectedModel);
      setApiKeyInput('');
      Alert.alert('Saved', 'Gemini key encrypted at rest.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleOpenArea = async (area: LearningAreaProgress) => {
    const mod = data?.modules.find((m) => m.code === area.module_code);
    if (mod?.status === 'LOCKED') {
      Alert.alert(
        'Module Locked',
        `${area.module_code} is strictly locked. Complete prerequisite requirements before accessing ${area.title}.`
      );
      return;
    }

    setSelectedArea(area);
    setSelectedTopic(null);
    setLoadingTopics(true);
    try {
      const tops = await MobileApi.getAreaTopics(area.id);
      setAreaTopics(tops);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load topics');
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleOpenTopic = async (topicId: number) => {
    setLoadingTopicDetail(true);
    try {
      const detail = await MobileApi.getTopicDetail(topicId);
      setSelectedTopic(detail);
    } catch (e: any) {
      Alert.alert('Access Denied', e.message || 'Failed to open topic');
    } finally {
      setLoadingTopicDetail(false);
    }
  };

  const handleOpenTaskFocus = async (task: Task) => {
    setFocusedTask(task);
    setFocusedTaskQuestions([]);
    if (task.topic_id) {
      try {
        const topDetail = await MobileApi.getTopicDetail(task.topic_id);
        setFocusedTaskQuestions(topDetail.questions || []);
      } catch (e) {
        // If topic detail fails, continue with task view
      }
    }
  };

  const handleToggleTopicStatus = async (topicId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED';
    try {
      await MobileApi.updateTopicProgress(topicId, nextStatus);
      if (selectedArea) {
        const tops = await MobileApi.getAreaTopics(selectedArea.id);
        setAreaTopics(tops);
      }
      if (selectedTopic && selectedTopic.id === topicId) {
        setSelectedTopic({ ...selectedTopic, user_status: nextStatus });
      }
      loadDashboard();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const nextStatus = task.user_status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      await MobileApi.updateTaskProgress(task.id, nextStatus);
      if (focusedTask && focusedTask.id === task.id) {
        setFocusedTask({ ...focusedTask, user_status: nextStatus });
      }
      const updatedList = await MobileApi.getAllTasks();
      setAllTasksList(updatedList);
      loadDashboard();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleModuleClick = (code: string) => {
    const mod = data?.modules.find((m) => m.code === code);
    if (mod?.status === 'LOCKED') {
      Alert.alert(
        `${code} is Locked`,
        mod.unlock_requirement_message || 'Complete prerequisite stage requirements to unlock this module.'
      );
    } else {
      setSelectedArea(null);
      setSelectedTopic(null);
      setActiveTab('Learn');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>CONNECTING TO LIFT BACKEND...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centerContainer}>
          <View style={styles.offlineIconBox}>
            <Text style={styles.offlineIconText}>OFFLINE</Text>
          </View>
          <Text style={styles.errorTitle}>Connection Failed</Text>
          <Text style={styles.errorDesc}>{error}</Text>
          <TouchableOpacity onPress={loadDashboard} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const bm1 = data?.modules.find((m) => m.code === 'BM1');
  const bm2 = data?.modules.find((m) => m.code === 'BM2');
  const toi = data?.modules.find((m) => m.code === 'TOI');

  const bottomBarPadding = insets.bottom > 0 ? insets.bottom : 8;
  const bottomBarHeight = 56 + bottomBarPadding;

  const tasksToDisplay = allTasksList.length > 0 ? allTasksList : data?.pending_tasks || [];
  const filteredTasks = tasksToDisplay.filter((t) => {
    const matchesFilter = taskFilter === 'ALL' || t.user_status === taskFilter;
    if (!matchesFilter) return false;
    if (searchQuery.trim().length === 0) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      (t.module_code || '').toLowerCase().includes(q) ||
      (t.task_type || '').toLowerCase().includes(q)
    );
  });

  // User initials for the circular avatar
  const userInitial = (currentUser?.full_name || currentUser?.username || 'U').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0B0D0C' : '#F0F1EC' }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* 1. TOP FLOATING ISLAND NAVIGATION */}
      <View style={[styles.topIsland, { backgroundColor: isDark ? 'rgba(22, 25, 23, 0.94)' : 'rgba(255, 255, 255, 0.94)', borderColor: isDark ? '#262A27' : '#E2E3DC' }]}>
        <View style={styles.topIslandRow}>
          {/* Brand & Stage cluster */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setSelectedArea(null);
              setSelectedTopic(null);
              setFocusedTask(null);
              setActiveTab('Home');
            }}
            style={styles.topBrandCluster}
          >
            <Image
              source={activeLogo}
              style={styles.topBrandLogoImage}
              resizeMode="contain"
            />
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.topBrandName, { color: isDark ? '#FFFFFF' : '#161917' }]}>LIFT</Text>
                <View style={[styles.topStageBadge, { backgroundColor: isDark ? '#202422' : '#F0F1EC', borderColor: isDark ? '#2E3330' : '#E2E3DC' }]}>
                  <View style={styles.topStageDot} />
                  <Text style={[styles.topStageText, { color: isDark ? '#9DE8BA' : '#161917' }]}>BM1</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Action cluster: Search | Theme Toggle | Profile */}
          <View style={styles.topActionCluster}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSearchOpen(!searchOpen)}
              style={[styles.topIconBtn, { backgroundColor: searchOpen ? (isDark ? '#2E3330' : '#E2E3DC') : (isDark ? '#202422' : '#F0F1EC'), borderColor: isDark ? '#2E3330' : '#E2E3DC' }]}
            >
              <Text style={[styles.topIconSymbol, { color: isDark ? '#FFFFFF' : '#161917' }]}>🔍</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setTheme(isDark ? 'light' : 'dark')}
              style={[styles.topIconBtn, { backgroundColor: isDark ? '#202422' : '#F0F1EC', borderColor: isDark ? '#2E3330' : '#E2E3DC' }]}
            >
              <Text style={[styles.topIconSymbol, { color: isDark ? '#FCE8A6' : '#634800' }]}>{isDark ? '🌙' : '☀️'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setProfileModalVisible(true)}
              style={styles.profileCircleBtn}
            >
              <View style={[styles.profileCircleInner, { backgroundColor: isDark ? '#262A27' : '#161917', borderColor: isDark ? '#363C38' : '#FFFFFF', borderWidth: 1 }]}>
                <Text style={styles.profileInitialText}>{userInitial}</Text>
              </View>
              <View style={styles.activeDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Collapsible Search Input inside the island */}
        {searchOpen && (
          <View style={[styles.topSearchBox, { borderTopColor: isDark ? '#262A27' : '#E2E3DC' }]}>
            <TextInput
              placeholder="Filter topics, tasks, workouts..."
              placeholderTextColor={isDark ? '#767C77' : '#8E928C'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.topSearchInput, { color: isDark ? '#FFFFFF' : '#161917', backgroundColor: isDark ? '#161917' : '#FFFFFF', borderColor: isDark ? '#2E3330' : '#E2E3DC' }]}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.topSearchClearBtn}>
                <Text style={{ color: isDark ? '#A3AAA4' : '#70746E', fontSize: 12, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: bottomBarHeight + 24 }]}
      >
        {/* 1. TOPIC DETAIL VIEW (Drill Down) */}
        {selectedTopic ? (
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() => setSelectedTopic(null)}
              style={styles.backButtonContainer}
            >
              <Text style={[styles.backButtonText, isDark && { color: '#FFFFFF' }]}>← Back to {selectedArea?.title || 'Topics'}</Text>
            </TouchableOpacity>

            <View style={[styles.overviewCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27', borderWidth: 1 }]}>
              <View style={styles.cardRow}>
                <Text style={styles.moduleTag}>{selectedTopic.module_code} • {selectedTopic.difficulty}</Text>
                <TouchableOpacity
                  onPress={() => handleToggleTopicStatus(selectedTopic.id, selectedTopic.user_status)}
                  style={[
                    styles.statusPill,
                    selectedTopic.user_status === 'COMPLETED' ? styles.statusPillComplete : styles.statusPillTodo,
                  ]}
                >
                  <Text style={styles.statusPillText}>
                    {selectedTopic.user_status === 'COMPLETED' ? '✓ Completed' : 'Mark Done'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.topicDetailTitle}>{selectedTopic.title}</Text>
              {selectedTopic.summary ? (
                <Text style={styles.topicDetailDesc}>{selectedTopic.summary}</Text>
              ) : null}
            </View>

            <Text style={[styles.sectionTitle, isDark && { color: '#888F89' }]}>STUDY MATERIAL</Text>
            {selectedTopic.materials && selectedTopic.materials.length > 0 ? (
              selectedTopic.materials.map((mat) => (
                <View key={mat.id} style={[styles.materialCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27' }]}>
                  <Text style={[styles.materialTitle, isDark && { color: '#FFFFFF' }]}>{mat.title}</Text>
                  <Text style={[styles.materialContent, isDark && { color: '#D1D5DB' }]}>{mat.content}</Text>
                </View>
              ))
            ) : (
              <View style={[styles.emptyCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27' }]}>
                <Text style={styles.emptyText}>No study notes attached.</Text>
              </View>
            )}

            <Text style={[styles.sectionTitle, isDark && { color: '#888F89' }]}>QUESTIONS & ANSWERS</Text>
            {selectedTopic.questions && selectedTopic.questions.length > 0 ? (
              selectedTopic.questions.map((q, idx) => (
                <View key={q.id} style={[styles.questionCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27' }]}>
                  <View style={styles.cardRow}>
                    <Text style={styles.questionNum}>QUESTION #{idx + 1}</Text>
                    <Text style={styles.badgeSmall}>{q.difficulty || 'INTERMEDIATE'}</Text>
                  </View>
                  <Text style={[styles.questionText, isDark && { color: '#FFFFFF' }]}>{q.question_text}</Text>
                  <TouchableOpacity
                    onPress={() => setShowAnswer((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                    style={styles.revealBtn}
                  >
                    <Text style={[styles.revealBtnText, isDark && { color: '#9DE8BA' }]}>
                      {showAnswer[q.id] ? '▲ Hide Solution' : '▼ Reveal Solution'}
                    </Text>
                  </TouchableOpacity>
                  {showAnswer[q.id] && (
                    <View style={[styles.solutionBox, isDark && { backgroundColor: '#202422' }]}>
                      <Text style={[styles.solutionText, isDark && { color: '#D1D5DB' }]}>{q.answer_text || 'No solution provided.'}</Text>
                    </View>
                  )}
                </View>
              ))
            ) : null}
          </View>
        ) : selectedArea ? (
          /* 2. AREA TOPIC LIST VIEW */
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() => setSelectedArea(null)}
              style={styles.backButtonContainer}
            >
              <Text style={[styles.backButtonText, isDark && { color: '#FFFFFF' }]}>← Back to Learning Areas</Text>
            </TouchableOpacity>

            <View style={[styles.overviewCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27', borderWidth: 1 }]}>
              <Text style={styles.cardHeaderSmall}>{selectedArea.module_code} CURRICULUM</Text>
              <Text style={styles.topicDetailTitle}>{selectedArea.title}</Text>
              <Text style={styles.topicDetailDesc}>{selectedArea.description}</Text>
              <View style={styles.cardRow}>
                <Text style={styles.statLabel}>
                  {selectedArea.completed_topics}/{selectedArea.total_topics} Completed
                </Text>
                <Text style={styles.statValue}>{selectedArea.completion_percent}%</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, isDark && { color: '#888F89' }]}>TOPICS (TAP TO OPEN)</Text>
            {loadingTopics ? (
              <ActivityIndicator color="#38bdf8" style={{ marginTop: 20 }} />
            ) : (
              areaTopics.map((top) => {
                const isDone = top.user_status === 'COMPLETED';
                return (
                  <TouchableOpacity
                    key={top.id}
                    onPress={() => handleOpenTopic(top.id)}
                    style={[styles.topicRowCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27' }]}
                  >
                    <TouchableOpacity
                      onPress={() => handleToggleTopicStatus(top.id, top.user_status)}
                      style={styles.checkIconBtn}
                    >
                      <Text style={[styles.checkIcon, isDone ? styles.checkDone : styles.checkTodo]}>
                        {isDone ? '✓' : '○'}
                      </Text>
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.topicTitle, isDark && !isDone && { color: '#FFFFFF' }, isDone && styles.topicTitleDone]}>
                        {top.title}
                      </Text>
                      {top.summary ? (
                        <Text style={[styles.topicSummary, isDark && { color: '#A3AAA4' }]} numberOfLines={1}>
                          {top.summary}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={styles.arrowIcon}>›</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        ) : focusedTask ? (
          /* 3. DEDICATED TASK FOCUS VIEW (with Back Button, Readability, and Q&A Cards) */
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() => setFocusedTask(null)}
              style={styles.backButtonContainer}
            >
              <Text style={[styles.backButtonText, isDark && { color: '#FFFFFF' }]}>← Back to Task List</Text>
            </TouchableOpacity>

            {/* High Readability Task Detail Focus Card */}
            <View style={[styles.taskFocusHeroCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27', borderWidth: 1 }]}>
              <View style={styles.cardRow}>
                <View style={styles.tagGroup}>
                  <Text style={styles.taskTypeBadge}>{focusedTask.task_type}</Text>
                  <Text style={[styles.priorityBadge, focusedTask.priority === 'HIGH' && styles.priorityHigh]}>
                    {focusedTask.priority}
                  </Text>
                  <Text style={styles.moduleBadge}>{focusedTask.module_code || 'BM1'}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleToggleTaskStatus(focusedTask)}
                  style={[
                    styles.statusPill,
                    focusedTask.user_status === 'COMPLETED' ? styles.statusPillComplete : styles.statusPillTodo,
                  ]}
                >
                  <Text style={styles.statusPillText}>
                    {focusedTask.user_status === 'COMPLETED' ? '✓ Completed' : '○ Mark Complete'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.taskFocusTitle}>{focusedTask.title}</Text>

              {focusedTask.description ? (
                <View style={styles.taskDescBox}>
                  <Text style={styles.taskFocusDescription}>{focusedTask.description}</Text>
                </View>
              ) : null}
            </View>

            {/* Questions & Answers Section Formatted as Readable Cards */}
            <View style={styles.qaSectionHeader}>
              <Text style={[styles.sectionTitle, isDark && { color: '#888F89' }]}>PRACTICE & INTERVIEW QUESTIONS</Text>
              <Text style={styles.subtextSmall}>Card-based self-testing for this task</Text>
            </View>

            {focusedTaskQuestions.length > 0 ? (
              focusedTaskQuestions.map((q, qIndex) => {
                const isRevealed = !!showAnswer[q.id];
                return (
                  <View key={q.id} style={[styles.qaCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27' }]}>
                    <View style={styles.cardRow}>
                      <Text style={[styles.qaCardNumber, isDark && { color: '#FFFFFF' }]}>QUESTION #{qIndex + 1}</Text>
                      <View style={styles.tagGroup}>
                        <Text style={styles.qaTypeTag}>{q.question_type}</Text>
                        <Text style={styles.qaDiffTag}>{q.difficulty || 'INTERMEDIATE'}</Text>
                      </View>
                    </View>

                    <Text style={[styles.qaQuestionPrompt, isDark && { color: '#FFFFFF' }]}>{q.question_text}</Text>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setShowAnswer((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                      style={[styles.qaRevealButton, isRevealed && styles.qaRevealButtonActive, isDark && { backgroundColor: isRevealed ? '#2E3330' : '#202422' }]}
                    >
                      <Text style={[styles.qaRevealButtonText, isDark && { color: '#9DE8BA' }]}>
                        {isRevealed ? '▲ Hide Authoritative Solution' : '▼ Reveal Authoritative Solution'}
                      </Text>
                    </TouchableOpacity>

                    {isRevealed && (
                      <View style={[styles.qaSolutionContainer, isDark && { backgroundColor: '#202422' }]}>
                        <Text style={styles.qaSolutionLabel}>SOLUTION & BREAKDOWN:</Text>
                        <Text style={[styles.qaSolutionBody, isDark && { color: '#D1D5DB' }]}>{q.answer_text || 'No solution text provided.'}</Text>
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={[styles.emptyCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27' }]}>
                <Text style={styles.emptyTitle}>Self-Assessment Questions</Text>
                <Text style={styles.emptyText}>
                  Use the Web Workspace AI Generator to draft instant interview & practice question cards for this topic.
                </Text>
              </View>
            )}
          </View>
        ) : activeTab === 'Tasks' ? (
          /* 4. MAIN TASKS AREA (With Back Button, Status Filters, High Readability) */
          <View style={styles.section}>
            {/* Back Button to Home Dashboard */}
            <TouchableOpacity
              onPress={() => setActiveTab('Home')}
              style={styles.backButtonContainer}
            >
              <Text style={styles.backButtonText}>← Back to Dashboard</Text>
            </TouchableOpacity>

            <View style={[styles.overviewCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27' }]}>
              <View style={styles.cardRow}>
                <Text style={styles.cardHeaderSmall}>TASKS & PRACTICE WORKSPACE</Text>
                <Text style={[styles.statValue, isDark && { color: '#FFFFFF' }]}>
                  {allTasksList.filter((t) => t.user_status === 'COMPLETED').length}/{allTasksList.length} Done
                </Text>
              </View>
              <Text style={[styles.topicDetailTitle, isDark && { color: '#FFFFFF' }]}>Action Items & Challenges</Text>
              <Text style={[styles.topicDetailDesc, isDark && { color: '#A3AAA4' }]}>
                Tap any task card to focus, view its detailed specification, and practice related question cards.
              </Text>
            </View>

            {/* Filter Pills */}
            <View style={styles.filterPillsRow}>
              {(['ALL', 'TODO', 'COMPLETED'] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setTaskFilter(filter)}
                  style={[
                    styles.filterPill,
                    isDark && { backgroundColor: '#202422', borderColor: '#2E3330' },
                    taskFilter === filter && (isDark ? { backgroundColor: '#9DE8BA', borderColor: '#9DE8BA' } : styles.filterPillActive),
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      isDark && { color: '#A3AAA4' },
                      taskFilter === filter && (isDark ? { color: '#0D381E', fontWeight: 'bold' } : styles.filterPillTextActive),
                    ]}
                  >
                    {filter === 'ALL' ? 'All Tasks' : filter === 'TODO' ? 'Pending' : 'Completed'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, isDark && { color: '#888F89' }]}>
              {taskFilter === 'ALL' ? 'ALL TASKS' : taskFilter === 'TODO' ? 'PENDING TASKS' : 'COMPLETED TASKS'} ({filteredTasks.length})
            </Text>

            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const isDone = task.user_status === 'COMPLETED';
                return (
                  <TouchableOpacity
                    key={task.id}
                    activeOpacity={0.7}
                    onPress={() => handleOpenTaskFocus(task)}
                    style={[
                      styles.taskCard,
                      isDark && { backgroundColor: '#161917', borderColor: '#262A27' },
                      isDone && (isDark ? { borderColor: '#1F3325', opacity: 0.8 } : styles.taskCardDone),
                    ]}
                  >
                    <View style={styles.cardRow}>
                      <View style={styles.tagGroup}>
                        <Text style={styles.taskType}>{task.task_type}</Text>
                        <Text style={[styles.priority, task.priority === 'HIGH' && styles.priorityHigh]}>
                          {task.priority}
                        </Text>
                        <Text style={styles.moduleBadge}>{task.module_code || 'BM1'}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleToggleTaskStatus(task)}
                        style={styles.taskToggleInline}
                      >
                        <Text style={[styles.checkIcon, isDone ? (isDark ? { color: '#9DE8BA' } : styles.checkDone) : styles.checkTodo]}>
                          {isDone ? '✓' : '○'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.taskTitle, isDark && { color: '#FFFFFF' }, isDone && (isDark ? { color: '#767C77', textDecorationLine: 'line-through' } : styles.taskTitleDone)]}>
                      {task.title}
                    </Text>

                    {task.description ? (
                      <Text style={[styles.taskDesc, isDark && { color: '#A3AAA4' }]} numberOfLines={2}>
                        {task.description}
                      </Text>
                    ) : null}

                    <View style={styles.cardFooterRow}>
                      <Text style={[styles.viewQuestionsHint, isDark && { color: '#9DE8BA' }]}>Tap to open questions & details ›</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={[styles.emptyCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27' }]}>
                <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>No tasks matching this filter.</Text>
                <Text style={[styles.emptyText, isDark && { color: '#A3AAA4' }]}>Try switching filters or clearing your search query.</Text>
              </View>
            )}
          </View>
        ) : activeTab === 'Home' ? (
          /* 5. HOME DASHBOARD */
          <View style={styles.section}>
            {/* Header Title & Subtitle */}
            <View style={{ marginBottom: 4 }}>
              <Text style={[styles.subtextSmall, isDark && { color: '#767C77' }]}>BENCHMARK READINESS PLAN</Text>
              <Text style={[styles.screenMainHeading, isDark && { color: '#FFFFFF' }]}>Your progress plan</Text>
            </View>

            {/* Dark Hero Focal Card (Inspired by Screen 1 Box Breathing card) */}
            <View style={[styles.overviewCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27' }]}>
              <View style={styles.cardRow}>
                <Text style={styles.cardHeaderSmall}>ACTIVE FOCUS WORKOUT</Text>
                <View style={styles.stageChip}>
                  <Text style={styles.stageChipText}>BM1 CURRICULUM</Text>
                </View>
              </View>

              <Text style={styles.hugePercent}>
                {bm1?.status === 'COMPLETED' ? 'BM1 Verified' : 'Week 1 Drills'}
              </Text>
              <Text style={styles.heroSubHeading}>Ready when you are</Text>
              <Text style={styles.formulaText}>
                Primitives · OOP · Memory & Closures · Machine Tasks
              </Text>

              {/* 4 Colored Indicator Pills */}
              <View style={styles.coloredPillRow}>
                <View style={[styles.coloredPillDot, { backgroundColor: '#FDD7AE' }]} />
                <View style={[styles.coloredPillDot, { backgroundColor: '#CDE9D6' }]} />
                <View style={[styles.coloredPillDot, { backgroundColor: '#FCE8A6' }]} />
                <View style={[styles.coloredPillDot, { backgroundColor: '#D4E2F8' }]} />
              </View>
            </View>

            {/* 4 Pastel Metric Tiles (2x2 Grid, Inspired by Screen 2) */}
            <View style={styles.pastelGrid}>
              {/* Tile 1: Apricot */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleModuleClick('BM1')}
                style={[styles.pastelCard, { backgroundColor: '#FDD7AE' }]}
              >
                <Text style={styles.pastelCardTag}>BM1 FOUNDATIONS</Text>
                <Text style={styles.pastelCardValue}>{bm1?.completion_percent || 0}%</Text>
                <Text style={styles.pastelCardSub}>{bm1?.completed_topics}/{bm1?.total_topics} topics</Text>
              </TouchableOpacity>

              {/* Tile 2: Sage / Mint */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleModuleClick('BM2')}
                style={[styles.pastelCard, { backgroundColor: '#CDE9D6' }]}
              >
                <Text style={styles.pastelCardTag}>BM2 SYSTEMS</Text>
                <Text style={styles.pastelCardValue}>
                  {bm2?.status === 'LOCKED' ? '0%' : `${bm2?.completion_percent || 0}%`}
                </Text>
                <Text style={styles.pastelCardSub}>
                  {bm2?.status === 'LOCKED' ? 'Locked (Needs BM1)' : `${bm2?.completed_topics} topics`}
                </Text>
              </TouchableOpacity>

              {/* Tile 3: Butter Yellow */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveTab('Tasks')}
                style={[styles.pastelCard, { backgroundColor: '#FCE8A6' }]}
              >
                <Text style={styles.pastelCardTag}>PENDING TASKS</Text>
                <Text style={styles.pastelCardValue}>{data?.pending_tasks.length || 0}</Text>
                <Text style={styles.pastelCardSub}>Active workouts</Text>
              </TouchableOpacity>

              {/* Tile 4: Periwinkle Blue */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleModuleClick('TOI')}
                style={[styles.pastelCard, { backgroundColor: '#D4E2F8' }]}
              >
                <Text style={styles.pastelCardTag}>TOI INTERVIEW</Text>
                <Text style={styles.pastelCardValue}>
                  {toi?.status === 'LOCKED' ? 'Locked' : 'Ready'}
                </Text>
                <Text style={styles.pastelCardSub}>Mock machine tasks</Text>
              </TouchableOpacity>
            </View>

            {/* Circular Readiness Gauge Card (Inspired by Screen 3) */}
            <View style={[styles.circularResultCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27' }]}>
              <Text style={[styles.subtextSmall, isDark && { color: '#767C77' }]}>CHECK-IN COMPLETE</Text>
              <Text style={[styles.resultTitle, isDark && { color: '#FFFFFF' }]}>Your readiness result</Text>

              {/* Circular Gauge Representation */}
              <View style={styles.circleGaugeContainer}>
                <View style={[styles.circleGaugeOuter, isDark && { borderColor: '#262A27' }]}>
                  <View style={styles.circleGaugeInner}>
                    <Text style={[styles.gaugeNumberText, isDark && { color: '#FFFFFF' }]}>{data?.overall_preparation_percent ?? 0}</Text>
                    <Text style={[styles.gaugeSubText, isDark && { color: '#767C77' }]}>OF 100</Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.gaugeStatusLabel, isDark && { color: '#FFFFFF' }]}>
                {data && data.overall_preparation_percent >= 80 ? 'Elevated Readiness' : 'Progressing Steady'}
              </Text>
              <Text style={[styles.gaugeStatusDesc, isDark && { color: '#A3AAA4' }]}>
                Your benchmark progress needs steady practice, not cramming.
              </Text>

              {/* What Drives It Progress Rows */}
              <View style={[styles.whatDrivesItBox, isDark && { backgroundColor: '#202422' }]}>
                <Text style={[styles.whatDrivesItTitle, isDark && { color: '#FFFFFF' }]}>What drives it</Text>

                <View style={styles.driverRow}>
                  <View style={styles.driverLabelRow}>
                    <Text style={[styles.driverName, isDark && { color: '#A3AAA4' }]}>BM1 Foundations</Text>
                    <Text style={[styles.driverValue, isDark && { color: '#FFFFFF' }]}>{bm1?.completion_percent || 0}%</Text>
                  </View>
                  <View style={[styles.driverBarTrack, isDark && { backgroundColor: '#2E3330' }]}>
                    <View
                      style={[
                        styles.driverBarFill,
                        { width: `${bm1?.completion_percent || 0}%`, backgroundColor: '#F87171' },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.driverRow}>
                  <View style={styles.driverLabelRow}>
                    <Text style={[styles.driverName, isDark && { color: '#A3AAA4' }]}>BM2 Systems</Text>
                    <Text style={[styles.driverValue, isDark && { color: '#FFFFFF' }]}>{bm2?.completion_percent || 0}%</Text>
                  </View>
                  <View style={[styles.driverBarTrack, isDark && { backgroundColor: '#2E3330' }]}>
                    <View
                      style={[
                        styles.driverBarFill,
                        { width: `${bm2?.completion_percent || 0}%`, backgroundColor: '#FBBF24' },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.driverRow}>
                  <View style={styles.driverLabelRow}>
                    <Text style={[styles.driverName, isDark && { color: '#A3AAA4' }]}>TOI Evaluation</Text>
                    <Text style={[styles.driverValue, isDark && { color: '#FFFFFF' }]}>{toi?.status === 'LOCKED' ? '0%' : '100%'}</Text>
                  </View>
                  <View style={[styles.driverBarTrack, isDark && { backgroundColor: '#2E3330' }]}>
                    <View
                      style={[
                        styles.driverBarFill,
                        { width: toi?.status === 'LOCKED' ? '0%' : '100%', backgroundColor: '#34D399' },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Immediate Focus (Numbered List Inspired by Screen 1 Next 30 Minutes) */}
            <View style={[styles.focusListBox, isDark && { backgroundColor: '#161917', borderColor: '#262A27' }]}>
              <Text style={[styles.subtextSmall, isDark && { color: '#767C77' }]}>NEXT FOCUS ACTIONS</Text>
              <Text style={[styles.resultTitle, isDark && { color: '#FFFFFF' }]}>Today's Priority Topics</Text>

              {data?.focus_areas && data.focus_areas.length > 0 ? (
                data.focus_areas.map((fa, idx) => (
                  <TouchableOpacity
                    key={fa.area_id}
                    onPress={() => {
                      const area = data?.learning_areas_progress.find((a) => a.id === fa.area_id);
                      if (area) handleOpenArea(area);
                    }}
                    style={[styles.focusNumberedRow, isDark && { borderBottomColor: '#262A27' }]}
                  >
                    <View style={[styles.numberCircle, isDark && { backgroundColor: '#202422' }]}>
                      <Text style={[styles.numberCircleText, isDark && { color: '#FFFFFF' }]}>{idx + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.focusItemTitle, isDark && { color: '#FFFFFF' }]}>{fa.area_title}</Text>
                      <Text style={[styles.focusItemSub, isDark && { color: '#A3AAA4' }]}>{fa.pending_topics_count} topics · {fa.module_code}</Text>
                    </View>
                    <Text style={[styles.focusItemPercent, isDark && { color: '#9DE8BA' }]}>{fa.completion_percent}% ›</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={[styles.emptyText, isDark && { color: '#A3AAA4' }]}>All active learning areas currently completed!</Text>
              )}

              {/* Mint Pill Button (Inspired by Screen 1 Start Reset Button) */}
              {data?.focus_areas && data.focus_areas.length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    const area = data?.learning_areas_progress.find(
                      (a) => a.id === data.focus_areas[0].area_id
                    );
                    if (area) handleOpenArea(area);
                  }}
                  style={styles.mintPillBtn}
                >
                  <Text style={styles.mintPillBtnText}>
                    Launch {data.focus_areas[0].area_title}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

        ) : activeTab === 'Learn' ? (
          /* 6. LEARN CURRICULUM */
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() => setActiveTab('Home')}
              style={styles.backButtonContainer}
            >
              <Text style={[styles.backButtonText, isDark && { color: '#FFFFFF' }]}>← Back to Dashboard</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, isDark && { color: '#888F89' }]}>LEARNING AREAS (TAP TO VIEW TOPICS)</Text>
            {data?.learning_areas_progress.map((area) => (
              <TouchableOpacity
                key={area.id}
                activeOpacity={0.7}
                onPress={() => handleOpenArea(area)}
                style={[styles.areaCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27' }]}
              >
                <View style={styles.cardRow}>
                  <Text style={[styles.areaTitle, isDark && { color: '#FFFFFF' }]}>{area.title}</Text>
                  <Text style={[styles.areaBadge, isDark && { backgroundColor: '#202422', color: '#9DE8BA' }]}>{area.module_code}</Text>
                </View>
                <Text style={[styles.areaDesc, isDark && { color: '#A3AAA4' }]}>{area.description}</Text>
                <View style={styles.cardRow}>
                  <Text style={[styles.statLabel, isDark && { color: '#767C77' }]}>{area.completed_topics}/{area.total_topics} topics</Text>
                  <Text style={[styles.statValue, isDark && { color: '#FFFFFF' }]}>{area.completion_percent}%</Text>
                </View>
                <Text style={[styles.cardActionHint, isDark && { color: '#9DE8BA' }]}>Tap to view topics ›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : activeTab === 'TOI' ? (
          /* 7. TOI STAGE */
          <View style={styles.centerContainer}>
            <View style={[styles.lockedTagBox, isDark && { backgroundColor: '#202422' }]}>
              <Text style={[styles.lockedTagBoxText, isDark && { color: '#A3AAA4' }]}>STAGE 03 • LOCKED</Text>
            </View>
            <Text style={[styles.errorTitle, isDark && { color: '#FFFFFF' }]}>TOI Stage Locked</Text>
            <Text style={[styles.errorDesc, isDark && { color: '#A3AAA4' }]}>
              Complete all BM1 and BM2 curriculum requirements to unlock live mock machine tasks.
            </Text>
          </View>
        ) : (
          /* 8. PROGRESS & SELF-ANALYTICS (Replaces "More" on bottom bar) */
          <View style={styles.section}>
            <View style={styles.analyticsHeaderRow}>
              <TouchableOpacity
                onPress={() => setActiveTab('Home')}
                style={styles.backButtonContainer}
              >
                <Text style={[styles.backButtonText, isDark && { color: '#FFFFFF' }]}>← Dashboard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => loadAnalytics(pacingDays)}
                disabled={analyticsLoading}
                style={[styles.recalcBtn, isDark && { backgroundColor: '#202422', borderWidth: 1, borderColor: '#2E3330' }]}
              >
                <Text style={[styles.recalcBtnText, isDark && { color: '#9DE8BA' }]}>
                  {analyticsLoading ? 'Computing...' : 'Recalculate'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Overview / Readiness Banner */}
            <View style={[styles.overviewCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27' }]}>
              <Text style={styles.cardHeaderSmall}>PREPARATION PROGRESS & VELOCITY</Text>
              <Text style={styles.hugePercent}>{data?.overall_preparation_percent}%</Text>
              <Text style={styles.formulaText}>Overall Readiness: BM1 (40%) + BM2 (40%) + TOI (20%)</Text>
            </View>

            {/* 4 Telemetry Metric Cards */}
            <View style={styles.telemetryGrid}>
              <View style={[styles.telemetryCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27', borderWidth: 1 }]}>
                <Text style={[styles.telemetryLabel, isDark && { color: '#888F89' }]}>DAILY OUTPUT</Text>
                <Text style={[styles.telemetryValue, isDark && { color: '#FFFFFF' }]}>{analyticsData?.daily_completed_count ?? 0}</Text>
                <Text style={[styles.telemetrySubtext, isDark && { color: '#A3AAA4' }]}>
                  Target: {analyticsData?.required_daily_pace ?? 1.0} / day
                </Text>
              </View>

              <View style={[styles.telemetryCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27', borderWidth: 1 }]}>
                <Text style={[styles.telemetryLabel, isDark && { color: '#888F89' }]}>WEEKLY OUTPUT</Text>
                <Text style={[styles.telemetryValue, isDark && { color: '#FFFFFF' }]}>{analyticsData?.weekly_completed_count ?? 0}</Text>
                <Text style={[styles.telemetrySubtext, isDark && { color: '#A3AAA4' }]}>
                  {analyticsData?.study_velocity_topics_per_day ?? 0.8} items / day
                </Text>
              </View>

              <View style={[styles.telemetryCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27', borderWidth: 1 }]}>
                <Text style={[styles.telemetryLabel, isDark && { color: '#888F89' }]}>CONSISTENCY</Text>
                <Text style={[styles.telemetryValue, isDark && { color: '#FFFFFF' }]}>{analyticsData?.current_streak_days ?? 2}d</Text>
                <Text style={[styles.telemetrySubtext, isDark && { color: '#A3AAA4' }]}>Active Streak</Text>
              </View>

              <View style={[styles.telemetryCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27', borderWidth: 1 }]}>
                <Text style={[styles.telemetryLabel, isDark && { color: '#888F89' }]}>BM1 PASS</Text>
                <Text style={[styles.telemetryValue, isDark && { color: '#FFFFFF' }, analyticsData?.bm1_readiness?.is_ready_to_unlock_bm2 ? styles.textEmerald : null]}>
                  {analyticsData?.bm1_readiness?.is_ready_to_unlock_bm2
                    ? 'READY'
                    : `${analyticsData?.projected_days_to_bm1_pass ?? 0}d`}
                </Text>
                <Text style={[styles.telemetrySubtext, isDark && { color: '#A3AAA4' }]}>
                  {analyticsData?.bm1_readiness?.is_ready_to_unlock_bm2 ? 'Requirements Met' : 'Projected remaining'}
                </Text>
              </View>
            </View>

            {/* Pacing Target Selector */}
            <View style={[styles.overviewCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27' }]}>
              <View style={styles.cardRow}>
                <Text style={styles.cardHeaderSmall}>CURRICULUM PACING TARGET</Text>
                <Text style={styles.badgeSmall}>{pacingDays} DAYS</Text>
              </View>
              <Text style={styles.topicDetailDesc}>
                Adjust learning trajectory. Choose 1-week intensive or extended 2+ week pacing.
              </Text>

              {/* Segmented Buttons */}
              <View style={[styles.pacingToggleRow, isDark && { backgroundColor: '#202422' }]}>
                {[
                  { days: 7, label: '1 Week (7d)' },
                  { days: 14, label: '2 Weeks (14d)' },
                  { days: 21, label: '3 Weeks (21d)' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.days}
                    onPress={() => {
                      setPacingDays(item.days);
                      loadAnalytics(item.days);
                    }}
                    style={[
                      styles.pacingToggleBtn,
                      pacingDays === item.days && (isDark ? { backgroundColor: '#2E3330' } : styles.pacingToggleBtnActive),
                    ]}
                  >
                    <Text
                      style={[
                        styles.pacingToggleText,
                        isDark && { color: '#A3AAA4' },
                        pacingDays === item.days && (isDark ? { color: '#FFFFFF', fontWeight: 'bold' } : styles.pacingToggleTextActive),
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.pacingDetailsBox, isDark && { backgroundColor: '#202422' }]}>
                <View style={styles.cardRow}>
                  <Text style={[styles.pacingDetailLabel, isDark && { color: '#A3AAA4' }]}>Required Daily Cadence:</Text>
                  <Text style={[styles.pacingDetailValue, isDark && { color: '#FFFFFF' }]}>{analyticsData?.required_daily_pace ?? 1.0} items / day</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={[styles.pacingDetailLabel, isDark && { color: '#A3AAA4' }]}>Items Pending in BM1:</Text>
                  <Text style={[styles.pacingDetailValue, isDark && { color: '#FFFFFF' }]}>{analyticsData?.total_remaining_bm1_items ?? 0} items</Text>
                </View>
              </View>
            </View>

            {/* Struggling Areas & Weak Spot Recommendations */}
            <Text style={[styles.sectionTitle, isDark && { color: '#888F89' }]}>STRUGGLING AREAS & WEAK SPOTS</Text>
            <Text style={[styles.subtextSmall, isDark && { color: '#767C77' }]}>
              Targeted recommendations actively computed until BM1 requirements are fully passed.
            </Text>

            {analyticsData?.struggling_areas && analyticsData.struggling_areas.length > 0 ? (
              analyticsData.struggling_areas.map((area) => {
                const isHigh = area.urgency_level === 'HIGH_URGENCY';
                const isMod = area.urgency_level === 'MODERATE';
                return (
                  <View
                    key={area.area_id}
                    style={[
                      styles.strugglingCard,
                      isDark
                        ? { backgroundColor: '#161917', borderColor: isHigh ? '#5A2229' : '#262A27' }
                        : isHigh
                        ? styles.strugglingCardHigh
                        : isMod
                        ? styles.strugglingCardMod
                        : styles.strugglingCardTrack,
                    ]}
                  >
                    <View style={styles.cardRow}>
                      <Text
                        style={[
                          styles.urgencyBadge,
                          isHigh ? styles.urgencyHigh : isMod ? styles.urgencyMod : styles.urgencyTrack,
                        ]}
                      >
                        {isHigh ? 'HIGH ATTENTION' : isMod ? 'MODERATE' : 'ON TRACK'}
                      </Text>
                      <Text style={[styles.statLabel, isDark && { color: '#767C77' }]}>{area.module_code}</Text>
                    </View>

                    <Text style={[styles.strugglingTitle, isDark && { color: '#FFFFFF' }]}>{area.area_title}</Text>
                    <Text style={[styles.strugglingRec, isDark && { color: '#A3AAA4' }]}>{area.recommendation}</Text>

                    <View style={styles.cardRow}>
                      <Text style={[styles.statLabel, isDark && { color: '#767C77' }]}>
                        {area.pending_topics_count} topics • {area.pending_tasks_count} tasks pending
                      </Text>
                      <Text style={[styles.statValue, isDark && { color: '#FFFFFF' }]}>{area.completion_percent}%</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        const targetArea = data?.learning_areas_progress.find((a) => a.id === area.area_id);
                        if (targetArea) {
                          handleOpenArea(targetArea);
                        } else {
                          setActiveTab('Learn');
                        }
                      }}
                      style={[styles.focusAreaBtn, isDark && { backgroundColor: '#9DE8BA' }]}
                    >
                      <Text style={[styles.focusAreaBtnText, isDark && { color: '#0D381E' }]}>Open Learning Topics ›</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <View style={[styles.emptyCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27' }]}>
                <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>Curriculum On Track</Text>
                <Text style={[styles.emptyText, isDark && { color: '#A3AAA4' }]}>
                  All BM1 areas are currently meeting requirements. Proceed with practical questions and tasks.
                </Text>
              </View>
            )}

            {/* BM1 Progression Gate Assessment */}
            <Text style={[styles.sectionTitle, isDark && { color: '#888F89' }]}>BM1 → BM2 PROGRESSION GATE ASSESSMENT</Text>
            <View style={[styles.overviewCard, isDark && { backgroundColor: '#161917', borderColor: '#262A27' }]}>
              <View style={styles.cardRow}>
                <Text style={styles.cardHeaderSmall}>GATE VERDICT</Text>
                <Text
                  style={[
                    styles.badgeSmall,
                    analyticsData?.bm1_readiness?.is_ready_to_unlock_bm2 ? styles.badgeSuccess : styles.badgeLocked,
                  ]}
                >
                  {analyticsData?.bm1_readiness?.is_ready_to_unlock_bm2 ? 'ADVANCEMENT UNLOCKED' : 'BM2 LOCKED'}
                </Text>
              </View>

              <View style={styles.progressRowContainer}>
                <View style={styles.cardRow}>
                  <Text style={[styles.statLabel, isDark && { color: '#767C77' }]}>Topics Requirement</Text>
                  <Text style={[styles.statValue, isDark && { color: '#FFFFFF' }]}>
                    {analyticsData?.bm1_readiness?.completed_topics ?? 0} / {analyticsData?.bm1_readiness?.total_topics ?? 0}
                  </Text>
                </View>
                <View style={[styles.progressBarTrack, isDark && { backgroundColor: '#262A27' }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      isDark && { backgroundColor: '#9DE8BA' },
                      {
                        width: `${
                          analyticsData?.bm1_readiness?.total_topics
                            ? Math.round(
                                ((analyticsData.bm1_readiness.completed_topics /
                                  analyticsData.bm1_readiness.total_topics) *
                                  100)
                              )
                            : 0
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.progressRowContainer}>
                <View style={styles.cardRow}>
                  <Text style={[styles.statLabel, isDark && { color: '#767C77' }]}>Required Tasks Requirement</Text>
                  <Text style={[styles.statValue, isDark && { color: '#FFFFFF' }]}>
                    {analyticsData?.bm1_readiness?.completed_tasks ?? 0} / {analyticsData?.bm1_readiness?.total_tasks ?? 0}
                  </Text>
                </View>
                <View style={[styles.progressBarTrack, isDark && { backgroundColor: '#262A27' }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      styles.progressBarFillEmerald,
                      {
                        width: `${
                          analyticsData?.bm1_readiness?.total_tasks
                            ? Math.round(
                                ((analyticsData.bm1_readiness.completed_tasks /
                                  analyticsData.bm1_readiness.total_tasks) *
                                  100)
                              )
                            : 0
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>

              {analyticsData?.bm1_readiness?.blocking_items && analyticsData.bm1_readiness.blocking_items.length > 0 ? (
                <View style={[styles.blockingBox, isDark && { backgroundColor: '#251C1A' }]}>
                  <Text style={[styles.blockingHeader, isDark && { color: '#FCA5A5' }]}>BLOCKING ITEMS BEFORE BM2 PASS:</Text>
                  {analyticsData.bm1_readiness.blocking_items.map((b, bIdx) => (
                    <Text key={bIdx} style={[styles.blockingItemText, isDark && { color: '#F87171' }]}>
                      • {b}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        )}
      </ScrollView>

      {/* 2. CENTER HOME QUICK-LAUNCH POP-UP DOCK */}
      {quickHubVisible && (
        <View style={styles.quickHubOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setQuickHubVisible(false)}
          />
          <View
            style={[
              styles.quickHubCard,
              {
                bottom: 78 + (insets.bottom > 0 ? insets.bottom : 12),
                backgroundColor: isDark ? 'rgba(22, 26, 24, 0.97)' : 'rgba(255, 255, 255, 0.97)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
              },
            ]}
          >
            {/* Grab handle indicator */}
            <View style={styles.quickHubHandleBar}>
              <View style={[styles.quickHubHandlePill, { backgroundColor: isDark ? '#363C38' : '#D1D5DB' }]} />
            </View>

            <View style={[styles.quickHubHeader, { borderBottomColor: isDark ? '#262A27' : '#F0F1EC' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image
                  source={activeLogo}
                  style={{ width: 22, height: 22, borderRadius: 6 }}
                  resizeMode="contain"
                />
                <Text style={[styles.quickHubHeaderTitle, { color: isDark ? '#FFFFFF' : '#161917' }]}>
                  LIFT NAVIGATION & QUICK HUB
                </Text>
              </View>
              <TouchableOpacity onPress={() => setQuickHubVisible(false)} style={{ padding: 4 }}>
                <Text style={{ color: isDark ? '#767C77' : '#8E928C', fontSize: 13, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Section A: Direct Page Navigation */}
            <Text style={[styles.quickHubSectionTag, { color: isDark ? '#888F89' : '#70746E' }]}>SELECT PAGE</Text>
            <View style={styles.quickHubGrid}>
              {/* Home */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setQuickHubVisible(false);
                  setSelectedArea(null);
                  setSelectedTopic(null);
                  setFocusedTask(null);
                  setActiveTab('Home');
                }}
                style={[
                  styles.quickHubItem,
                  {
                    backgroundColor: activeTab === 'Home' && !selectedArea && !selectedTopic && !focusedTask
                      ? (isDark ? '#2A362E' : '#E6F4EA')
                      : (isDark ? '#202422' : '#F0F1EC'),
                    borderColor: activeTab === 'Home' && !selectedArea && !selectedTopic && !focusedTask
                      ? (isDark ? '#9DE8BA' : '#161917')
                      : (isDark ? '#2E3330' : '#E2E3DC'),
                  },
                ]}
              >
                <Text style={styles.quickHubIcon}>⌂</Text>
                <Text style={[styles.quickHubLabel, { color: isDark ? '#FFFFFF' : '#161917' }]}>Dashboard</Text>
                <Text style={[styles.quickHubSub, { color: isDark ? '#A3AAA4' : '#70746E' }]}>Readiness plan</Text>
              </TouchableOpacity>

              {/* Learn */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setQuickHubVisible(false);
                  setSelectedArea(null);
                  setSelectedTopic(null);
                  setFocusedTask(null);
                  setActiveTab('Learn');
                }}
                style={[
                  styles.quickHubItem,
                  {
                    backgroundColor: activeTab === 'Learn'
                      ? (isDark ? '#2A362E' : '#E6F4EA')
                      : (isDark ? '#202422' : '#F0F1EC'),
                    borderColor: activeTab === 'Learn'
                      ? (isDark ? '#9DE8BA' : '#161917')
                      : (isDark ? '#2E3330' : '#E2E3DC'),
                  },
                ]}
              >
                <Text style={styles.quickHubIcon}>⊞</Text>
                <Text style={[styles.quickHubLabel, { color: isDark ? '#FFFFFF' : '#161917' }]}>Learn</Text>
                <Text style={[styles.quickHubSub, { color: isDark ? '#A3AAA4' : '#70746E' }]}>BM1 & BM2 topics</Text>
              </TouchableOpacity>

              {/* Tasks */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setQuickHubVisible(false);
                  setSelectedArea(null);
                  setSelectedTopic(null);
                  setFocusedTask(null);
                  setActiveTab('Tasks');
                }}
                style={[
                  styles.quickHubItem,
                  {
                    backgroundColor: activeTab === 'Tasks'
                      ? (isDark ? '#2A362E' : '#E6F4EA')
                      : (isDark ? '#202422' : '#F0F1EC'),
                    borderColor: activeTab === 'Tasks'
                      ? (isDark ? '#9DE8BA' : '#161917')
                      : (isDark ? '#2E3330' : '#E2E3DC'),
                  },
                ]}
              >
                <Text style={styles.quickHubIcon}>✓</Text>
                <Text style={[styles.quickHubLabel, { color: isDark ? '#FFFFFF' : '#161917' }]}>Tasks</Text>
                <Text style={[styles.quickHubSub, { color: isDark ? '#A3AAA4' : '#70746E' }]}>{allTasksList.length} workouts</Text>
              </TouchableOpacity>

              {/* TOI */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setQuickHubVisible(false);
                  setSelectedArea(null);
                  setSelectedTopic(null);
                  setFocusedTask(null);
                  setActiveTab('TOI');
                }}
                style={[
                  styles.quickHubItem,
                  {
                    backgroundColor: activeTab === 'TOI'
                      ? (isDark ? '#2A362E' : '#E6F4EA')
                      : (isDark ? '#202422' : '#F0F1EC'),
                    borderColor: activeTab === 'TOI'
                      ? (isDark ? '#9DE8BA' : '#161917')
                      : (isDark ? '#2E3330' : '#E2E3DC'),
                  },
                ]}
              >
                <Text style={styles.quickHubIcon}>◈</Text>
                <Text style={[styles.quickHubLabel, { color: isDark ? '#FFFFFF' : '#161917' }]}>TOI Mock</Text>
                <Text style={[styles.quickHubSub, { color: isDark ? '#A3AAA4' : '#70746E' }]}>Interview sim</Text>
              </TouchableOpacity>
            </View>

            {/* Section B: Fast Shortcuts */}
            <Text style={[styles.quickHubSectionTag, { color: isDark ? '#888F89' : '#70746E', marginTop: 4 }]}>QUICK ACTIONS</Text>
            <View style={styles.quickHubShortcutRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setQuickHubVisible(false);
                  if (data?.focus_areas && data.focus_areas.length > 0) {
                    const area = data?.learning_areas_progress.find(
                      (a) => a.id === data.focus_areas[0].area_id
                    );
                    if (area) handleOpenArea(area);
                  } else {
                    setActiveTab('Learn');
                  }
                }}
                style={[styles.quickHubShortcutBtn, { backgroundColor: isDark ? '#202422' : '#F0F1EC', borderColor: isDark ? '#2E3330' : '#E2E3DC' }]}
              >
                <Text style={styles.quickHubShortcutIcon}>⚡</Text>
                <Text style={[styles.quickHubShortcutLabel, { color: isDark ? '#FFFFFF' : '#161917' }]}>Priority Drill</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setQuickHubVisible(false);
                  setSelectedArea(null);
                  setSelectedTopic(null);
                  setFocusedTask(null);
                  setActiveTab('Progress');
                }}
                style={[styles.quickHubShortcutBtn, { backgroundColor: isDark ? '#202422' : '#F0F1EC', borderColor: isDark ? '#2E3330' : '#E2E3DC' }]}
              >
                <Text style={styles.quickHubShortcutIcon}>↗</Text>
                <Text style={[styles.quickHubShortcutLabel, { color: isDark ? '#FFFFFF' : '#161917' }]}>Telemetry</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setQuickHubVisible(false);
                  setProfileModalVisible(true);
                }}
                style={[styles.quickHubShortcutBtn, { backgroundColor: isDark ? '#202422' : '#F0F1EC', borderColor: isDark ? '#2E3330' : '#E2E3DC' }]}
              >
                <Text style={styles.quickHubShortcutIcon}>⚙️</Text>
                <Text style={[styles.quickHubShortcutLabel, { color: isDark ? '#FFFFFF' : '#161917' }]}>BYOK AI</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setQuickHubVisible(false);
                  handleQuickSwitchUser(currentUser?.username === 'user1' ? 'user2' : 'user1');
                }}
                style={[styles.quickHubShortcutBtn, { backgroundColor: isDark ? '#202422' : '#F0F1EC', borderColor: isDark ? '#2E3330' : '#E2E3DC' }]}
              >
                <Text style={styles.quickHubShortcutIcon}>👤</Text>
                <Text style={[styles.quickHubShortcutLabel, { color: isDark ? '#FFFFFF' : '#161917' }]}>Partner</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 3. MINIMAL FLOATING BOTTOM MENU BAR (5 SLOTS WITH CENTER HOME HUB) */}
      <View
        style={[
          styles.bottomNavIsland,
          {
            bottom: insets.bottom > 0 ? insets.bottom : 12,
            backgroundColor: isDark ? 'rgba(20, 24, 22, 0.94)' : 'rgba(255, 255, 255, 0.94)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}
      >
        {/* Slot 1: Learn */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setSelectedArea(null);
            setSelectedTopic(null);
            setFocusedTask(null);
            setActiveTab('Learn');
          }}
          style={styles.navSlot}
        >
          <View style={[styles.navSlotPill, activeTab === 'Learn' && !selectedArea && !selectedTopic && !focusedTask && (isDark ? styles.navSlotActiveDark : styles.navSlotActiveLight)]}>
            <Text style={[styles.navIconText, activeTab === 'Learn' && (isDark ? styles.navIconActiveDark : styles.navIconActiveLight)]}>⊞</Text>
            <Text style={[styles.navLabel, activeTab === 'Learn' ? (isDark ? styles.navLabelActiveDark : styles.navLabelActiveLight) : (isDark ? styles.navLabelInactiveDark : styles.navLabelInactiveLight)]}>
              Learn
            </Text>
          </View>
        </TouchableOpacity>

        {/* Slot 2: Tasks */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setSelectedArea(null);
            setSelectedTopic(null);
            setFocusedTask(null);
            setActiveTab('Tasks');
          }}
          style={styles.navSlot}
        >
          <View style={[styles.navSlotPill, activeTab === 'Tasks' && !focusedTask && (isDark ? styles.navSlotActiveDark : styles.navSlotActiveLight)]}>
            <Text style={[styles.navIconText, activeTab === 'Tasks' && (isDark ? styles.navIconActiveDark : styles.navIconActiveLight)]}>✓</Text>
            <Text style={[styles.navLabel, activeTab === 'Tasks' ? (isDark ? styles.navLabelActiveDark : styles.navLabelActiveLight) : (isDark ? styles.navLabelInactiveDark : styles.navLabelInactiveLight)]}>
              Tasks
            </Text>
          </View>
        </TouchableOpacity>

        {/* Slot 3: CENTER HOME BUTTON (Hero Island Hub) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (activeTab === 'Home' && !selectedArea && !selectedTopic && !focusedTask) {
              setQuickHubVisible(!quickHubVisible);
            } else {
              setSelectedArea(null);
              setSelectedTopic(null);
              setFocusedTask(null);
              setActiveTab('Home');
            }
          }}
          onLongPress={() => setQuickHubVisible(true)}
          style={styles.navCenterHubSlot}
        >
          <View
            style={[
              styles.navCenterHubBtn,
              activeTab === 'Home' && !selectedArea && !selectedTopic && !focusedTask
                ? (isDark ? styles.navCenterHubActiveDark : styles.navCenterHubActiveLight)
                : (isDark ? styles.navCenterHubInactiveDark : styles.navCenterHubInactiveLight),
            ]}
          >
            <Text
              style={[
                styles.navCenterHubIcon,
                activeTab === 'Home' && !selectedArea && !selectedTopic && !focusedTask
                  ? (isDark ? styles.navCenterHubIconActiveDark : styles.navCenterHubIconActiveLight)
                  : (isDark ? styles.navCenterHubIconInactiveDark : styles.navCenterHubIconInactiveLight),
              ]}
            >
              ⌂
            </Text>
          </View>
        </TouchableOpacity>

        {/* Slot 4: TOI */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setSelectedArea(null);
            setSelectedTopic(null);
            setFocusedTask(null);
            setActiveTab('TOI');
          }}
          style={styles.navSlot}
        >
          <View style={[styles.navSlotPill, activeTab === 'TOI' && (isDark ? styles.navSlotActiveDark : styles.navSlotActiveLight)]}>
            <Text style={[styles.navIconText, activeTab === 'TOI' && (isDark ? styles.navIconActiveDark : styles.navIconActiveLight)]}>◈</Text>
            <Text style={[styles.navLabel, activeTab === 'TOI' ? (isDark ? styles.navLabelActiveDark : styles.navLabelActiveLight) : (isDark ? styles.navLabelInactiveDark : styles.navLabelInactiveLight)]}>
              TOI
            </Text>
          </View>
        </TouchableOpacity>

        {/* Slot 5: Progress */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setSelectedArea(null);
            setSelectedTopic(null);
            setFocusedTask(null);
            setActiveTab('Progress');
          }}
          style={styles.navSlot}
        >
          <View style={[styles.navSlotPill, activeTab === 'Progress' && (isDark ? styles.navSlotActiveDark : styles.navSlotActiveLight)]}>
            <Text style={[styles.navIconText, activeTab === 'Progress' && (isDark ? styles.navIconActiveDark : styles.navIconActiveLight)]}>↗</Text>
            <Text style={[styles.navLabel, activeTab === 'Progress' ? (isDark ? styles.navLabelActiveDark : styles.navLabelActiveLight) : (isDark ? styles.navLabelInactiveDark : styles.navLabelInactiveLight)]}>
              Stats
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* PROFILE & SETTINGS MODAL (Triggered by Circular Profile Avatar) */}
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, isDark && { backgroundColor: '#161917', borderColor: '#262A27', borderWidth: 1 }, { paddingBottom: insets.bottom + 16 }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeaderRow, isDark && { borderBottomColor: '#262A27' }]}>
              <View style={styles.modalUserHeader}>
                <Image
                  source={activeLogo}
                  style={{ width: 44, height: 44, borderRadius: 12 }}
                  resizeMode="contain"
                />
                <View>
                  <Text style={[styles.modalUserName, isDark && { color: '#FFFFFF' }]}>{currentUser?.full_name || currentUser?.username || 'User'}</Text>
                  <Text style={[styles.modalUserEmail, isDark && { color: '#A3AAA4' }]}>{currentUser?.email || 'Logged in'}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setProfileModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={[styles.modalCloseBtnText, isDark && { color: '#A3AAA4' }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 440 }}>
              {/* App Icon / Logo Theme Switcher */}
              <Text style={[styles.modalSectionLabel, isDark && { color: '#888F89' }]}>APP ICON & LOGO THEME</Text>
              <View style={styles.logoPickerRow}>
                {/* Auto / Adaptive */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setLogoTheme('auto')}
                  style={[
                    styles.logoPickerCard,
                    isDark && { backgroundColor: '#202422', borderColor: '#2E3330' },
                    logoTheme === 'auto' && (isDark ? { borderColor: '#9DE8BA', backgroundColor: '#1C2921' } : { borderColor: '#161917', backgroundColor: '#F0F1EC' }),
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={logoDark} style={{ width: 22, height: 22, borderRadius: 6, marginRight: -6, zIndex: 1 }} resizeMode="contain" />
                    <Image source={logoLight} style={{ width: 22, height: 22, borderRadius: 6 }} resizeMode="contain" />
                  </View>
                  <Text style={[styles.logoPickerTitle, isDark && { color: '#FFFFFF' }]}>Adaptive</Text>
                  <Text style={[styles.logoPickerSub, isDark && { color: '#A3AAA4' }]}>Auto</Text>
                  {logoTheme === 'auto' && (
                    <View style={[styles.logoActiveCheck, isDark && { backgroundColor: '#9DE8BA' }]}>
                      <Text style={{ fontSize: 9, color: isDark ? '#0D381E' : '#FFFFFF', fontWeight: 'bold' }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Onyx Dark */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setLogoTheme('dark')}
                  style={[
                    styles.logoPickerCard,
                    isDark && { backgroundColor: '#202422', borderColor: '#2E3330' },
                    logoTheme === 'dark' && (isDark ? { borderColor: '#9DE8BA', backgroundColor: '#1C2921' } : { borderColor: '#161917', backgroundColor: '#F0F1EC' }),
                  ]}
                >
                  <Image source={logoDark} style={{ width: 32, height: 32, borderRadius: 8 }} resizeMode="contain" />
                  <Text style={[styles.logoPickerTitle, isDark && { color: '#FFFFFF' }]}>Onyx Dark</Text>
                  <Text style={[styles.logoPickerSub, isDark && { color: '#A3AAA4' }]}>Obsidian</Text>
                  {logoTheme === 'dark' && (
                    <View style={[styles.logoActiveCheck, isDark && { backgroundColor: '#9DE8BA' }]}>
                      <Text style={{ fontSize: 9, color: isDark ? '#0D381E' : '#FFFFFF', fontWeight: 'bold' }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Alabaster Light */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setLogoTheme('light')}
                  style={[
                    styles.logoPickerCard,
                    isDark && { backgroundColor: '#202422', borderColor: '#2E3330' },
                    logoTheme === 'light' && (isDark ? { borderColor: '#9DE8BA', backgroundColor: '#1C2921' } : { borderColor: '#161917', backgroundColor: '#F0F1EC' }),
                  ]}
                >
                  <Image source={logoLight} style={{ width: 32, height: 32, borderRadius: 8 }} resizeMode="contain" />
                  <Text style={[styles.logoPickerTitle, isDark && { color: '#FFFFFF' }]}>Alabaster</Text>
                  <Text style={[styles.logoPickerSub, isDark && { color: '#A3AAA4' }]}>Frosted</Text>
                  {logoTheme === 'light' && (
                    <View style={[styles.logoActiveCheck, isDark && { backgroundColor: '#9DE8BA' }]}>
                      <Text style={{ fontSize: 9, color: isDark ? '#0D381E' : '#FFFFFF', fontWeight: 'bold' }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Quick Switch Demo Users */}
              <Text style={[styles.modalSectionLabel, isDark && { color: '#888F89' }]}>SWITCH ACTIVE USER</Text>
              <View style={styles.quickSwitchRow}>
                <TouchableOpacity
                  onPress={() => handleQuickSwitchUser('user1')}
                  style={[
                    styles.quickSwitchBtn,
                    isDark && { backgroundColor: '#202422', borderColor: '#2E3330' },
                    currentUser?.username === 'user1' && (isDark ? { backgroundColor: '#9DE8BA', borderColor: '#9DE8BA' } : styles.quickSwitchBtnActive),
                  ]}
                >
                  <Text style={[styles.quickSwitchText, isDark && { color: '#FFFFFF' }, currentUser?.username === 'user1' && isDark && { color: '#0D381E' }]}>User 1 (Nivin)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleQuickSwitchUser('user2')}
                  style={[
                    styles.quickSwitchBtn,
                    isDark && { backgroundColor: '#202422', borderColor: '#2E3330' },
                    currentUser?.username === 'user2' && (isDark ? { backgroundColor: '#9DE8BA', borderColor: '#9DE8BA' } : styles.quickSwitchBtnActive),
                  ]}
                >
                  <Text style={[styles.quickSwitchText, isDark && { color: '#FFFFFF' }, currentUser?.username === 'user2' && isDark && { color: '#0D381E' }]}>User 2 (Partner)</Text>
                </TouchableOpacity>
              </View>

              {/* Login / Register with Any Email & Password */}
              <Text style={[styles.modalSectionLabel, isDark && { color: '#888F89' }]}>
                {isRegisterMode ? 'REGISTER WITH ANY EMAIL' : 'SIGN IN WITH ANY EMAIL'}
              </Text>
              <View style={[styles.authBox, isDark && { backgroundColor: '#1B1F1C' }]}>
                <TextInput
                  placeholder="Enter email (e.g. nivin@gmail.com)"
                  placeholderTextColor={isDark ? '#767C77' : '#64748b'}
                  value={customEmail}
                  onChangeText={setCustomEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.authInput, isDark && { backgroundColor: '#202422', borderColor: '#2E3330', color: '#FFFFFF' }]}
                />
                <TextInput
                  placeholder="Enter password"
                  placeholderTextColor={isDark ? '#767C77' : '#64748b'}
                  value={customPassword}
                  onChangeText={setCustomPassword}
                  secureTextEntry
                  style={[styles.authInput, isDark && { backgroundColor: '#202422', borderColor: '#2E3330', color: '#FFFFFF' }]}
                />

                <TouchableOpacity
                  onPress={handleCustomAuth}
                  disabled={authSubmitting}
                  style={[styles.authSubmitBtn, isDark && { backgroundColor: '#9DE8BA' }]}
                >
                  <Text style={[styles.authSubmitBtnText, isDark && { color: '#0D381E' }]}>
                    {authSubmitting ? 'Authenticating...' : isRegisterMode ? 'Create Account & Sign In' : 'Sign In with Email'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsRegisterMode(!isRegisterMode)}
                  style={{ marginTop: 8, alignItems: 'center' }}
                >
                  <Text style={[styles.authToggleText, isDark && { color: '#9DE8BA' }]}>
                    {isRegisterMode ? 'Already have an account? Sign In' : 'Need a new account? Register'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Gemini BYOK Config */}
              <Text style={[styles.modalSectionLabel, isDark && { color: '#888F89' }]}>GEMINI BYOK CONFIGURATION</Text>
              <View style={[styles.authBox, isDark && { backgroundColor: '#1B1F1C' }]}>
                <TextInput
                  placeholder="Paste Gemini API Key..."
                  placeholderTextColor={isDark ? '#767C77' : '#64748b'}
                  value={apiKeyInput}
                  onChangeText={setApiKeyInput}
                  secureTextEntry
                  style={[styles.authInput, isDark && { backgroundColor: '#202422', borderColor: '#2E3330', color: '#FFFFFF' }]}
                />
                <View style={styles.byokButtonRow}>
                  <TouchableOpacity
                    onPress={handleTestKey}
                    disabled={testingKey}
                    style={[styles.byokTestBtn, isDark && { backgroundColor: '#202422', borderColor: '#2E3330', borderWidth: 1 }]}
                  >
                    <Text style={[styles.byokTestBtnText, isDark && { color: '#FFFFFF' }]}>
                      {testingKey ? 'Testing...' : 'Test Connection'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSaveKey}
                    style={[styles.byokSaveBtn, isDark && { backgroundColor: '#9DE8BA' }]}
                  >
                    <Text style={[styles.byokSaveBtnText, isDark && { color: '#0D381E' }]}>Save Key</Text>
                  </TouchableOpacity>
                </View>
                {testResult ? (
                  <Text style={[styles.testResultText, isDark && { color: '#9DE8BA' }]}>{testResult}</Text>
                ) : null}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F1EC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#70746E',
    fontFamily: 'monospace',
    fontSize: 12,
    marginTop: 12,
  },
  errorTitle: {
    color: '#E11D48',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
  },
  errorDesc: {
    color: '#70746E',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#161917',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  // Floating Top Island Navigation
  topIsland: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  topIslandRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBrandCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topBrandLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBrandLogoText: {
    fontSize: 13,
    fontWeight: '900',
  },
  topBrandName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  topStageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
  },
  topStageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  topStageText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  topActionCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  topIconSymbol: {
    fontSize: 14,
  },
  topSearchBox: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  topSearchInput: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  topSearchClearBtn: {
    position: 'absolute',
    right: 22,
    padding: 6,
  },
  profileCircleBtn: {
    position: 'relative',
  },
  profileCircleInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileInitialText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  activeDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#9DE8BA',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 90,
  },
  section: {
    gap: 14,
  },
  screenMainHeading: {
    color: '#161917',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  backButtonContainer: {
    paddingVertical: 6,
    marginBottom: 4,
  },
  backButtonText: {
    color: '#161917',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#70746E',
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 2,
    fontWeight: '600',
  },
  subtextSmall: {
    color: '#8E928C',
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 0.8,
    fontWeight: '600',
  },

  // Dark Hero Card (Screen 1 Box Breathing Style)
  overviewCard: {
    backgroundColor: '#161917',
    borderRadius: 24,
    padding: 22,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  stageChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#262A27',
  },
  stageChipText: {
    color: '#CDE9D6',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  heroSubHeading: {
    color: '#E0E2DC',
    fontSize: 14,
    fontWeight: '600',
  },
  cardHeaderSmall: {
    color: '#A0A49E',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '600',
    letterSpacing: 1,
  },
  hugePercent: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  formulaText: {
    color: '#8E928C',
    fontSize: 11,
    lineHeight: 16,
  },
  coloredPillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  coloredPillDot: {
    width: 28,
    height: 5,
    borderRadius: 3,
  },

  // 4 Pastel Metric Tiles (Screen 2 2x2 Grid Style)
  pastelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pastelCard: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 112,
  },
  pastelCardTag: {
    color: '#262927',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 0.6,
  },
  pastelCardValue: {
    color: '#161917',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  pastelCardSub: {
    color: '#4A4F4A',
    fontSize: 11,
    fontWeight: '500',
  },

  // Circular Readiness Result Card (Screen 3 Style)
  circularResultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E3DC',
    padding: 22,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  resultTitle: {
    color: '#161917',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  circleGaugeContainer: {
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleGaugeOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#FDD7AE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleGaugeInner: {
    alignItems: 'center',
  },
  gaugeNumberText: {
    color: '#161917',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  gaugeSubText: {
    color: '#8E928C',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  gaugeStatusLabel: {
    color: '#161917',
    fontSize: 15,
    fontWeight: 'bold',
  },
  gaugeStatusDesc: {
    color: '#70746E',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    maxWidth: 240,
  },
  whatDrivesItBox: {
    width: '100%',
    backgroundColor: '#F0F1EC',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    gap: 10,
  },
  whatDrivesItTitle: {
    color: '#161917',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  driverRow: {
    gap: 4,
  },
  driverLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverName: {
    color: '#4A4F4A',
    fontSize: 12,
    fontWeight: '500',
  },
  driverValue: {
    color: '#161917',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  driverBarTrack: {
    height: 6,
    backgroundColor: '#E2E3DC',
    borderRadius: 3,
    overflow: 'hidden',
  },
  driverBarFill: {
    height: 6,
    borderRadius: 3,
  },

  // Focus Numbered List (Screen 1 Style)
  focusListBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E3DC',
    padding: 20,
    gap: 12,
  },
  focusNumberedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1EC',
    gap: 12,
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F1EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberCircleText: {
    color: '#161917',
    fontSize: 12,
    fontWeight: 'bold',
  },
  focusItemTitle: {
    color: '#161917',
    fontSize: 14,
    fontWeight: '600',
  },
  focusItemSub: {
    color: '#8E928C',
    fontSize: 11,
    marginTop: 1,
  },
  focusItemPercent: {
    color: '#161917',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mintPillBtn: {
    backgroundColor: '#9DE8BA',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#9DE8BA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  mintPillBtnText: {
    color: '#0D381E',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Module and Area Cards
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  bm1Border: {
    borderColor: '#CDE9D6',
  },
  bm2Border: {
    borderColor: '#FDD7AE',
  },
  lockedCard: {
    borderColor: '#E2E3DC',
    opacity: 0.65,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleTag: {
    color: '#70746E',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  moduleName: {
    color: '#161917',
    fontSize: 15,
    fontWeight: 'bold',
  },
  statusActive: {
    color: '#0D381E',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    backgroundColor: '#CDE9D6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusLocked: {
    color: '#70746E',
    fontSize: 10,
    fontFamily: 'monospace',
    backgroundColor: '#F0F1EC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  lockMsg: {
    color: '#8E928C',
    fontSize: 11,
    fontStyle: 'italic',
  },
  statLabel: {
    color: '#70746E',
    fontSize: 12,
  },
  statValue: {
    color: '#161917',
    fontSize: 13,
    fontWeight: 'bold',
  },
  cardActionHint: {
    color: '#161917',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  areaCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E3DC',
    borderRadius: 20,
    padding: 16,
    gap: 6,
  },
  areaTitle: {
    color: '#161917',
    fontSize: 15,
    fontWeight: 'bold',
  },
  areaBadge: {
    color: '#161917',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    backgroundColor: '#F0F1EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  areaDesc: {
    color: '#70746E',
    fontSize: 12,
    lineHeight: 17,
  },
  focusCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E3DC',
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  focusCount: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '600',
  },

  // Task Filter Pills & Cards
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E3DC',
  },
  filterPillActive: {
    backgroundColor: '#161917',
    borderColor: '#161917',
  },
  filterPillText: {
    color: '#70746E',
    fontSize: 11,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E3DC',
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  taskCardDone: {
    opacity: 0.6,
    backgroundColor: '#F0F1EC',
  },
  tagGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskType: {
    color: '#161917',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    backgroundColor: '#F0F1EC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priority: {
    color: '#70746E',
    fontSize: 10,
    fontFamily: 'monospace',
    backgroundColor: '#F0F1EC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityHigh: {
    color: '#9A3412',
    backgroundColor: '#FDD7AE',
  },
  moduleBadge: {
    color: '#161917',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  taskToggleInline: {
    padding: 4,
  },
  taskTitle: {
    color: '#161917',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 19,
  },
  taskTitleDone: {
    color: '#8E928C',
    textDecorationLine: 'line-through',
  },
  taskDesc: {
    color: '#70746E',
    fontSize: 12,
    lineHeight: 17,
  },
  cardFooterRow: {
    marginTop: 4,
  },
  viewQuestionsHint: {
    color: '#161917',
    fontSize: 11,
    fontWeight: '600',
  },

  // Focus Task Detail View
  taskFocusHeroCard: {
    backgroundColor: '#161917',
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  taskTypeBadge: {
    color: '#161917',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    backgroundColor: '#9DE8BA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityBadge: {
    color: '#E0E2DC',
    fontSize: 11,
    fontFamily: 'monospace',
    backgroundColor: '#262A27',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  taskFocusTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 26,
  },
  taskDescBox: {
    backgroundColor: '#262A27',
    borderRadius: 14,
    padding: 14,
  },
  taskFocusDescription: {
    color: '#E0E2DC',
    fontSize: 13,
    lineHeight: 20,
  },
  qaSectionHeader: {
    marginTop: 8,
  },
  qaCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E3DC',
    borderRadius: 20,
    padding: 18,
    gap: 10,
  },
  qaCardNumber: {
    color: '#161917',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  qaTypeTag: {
    color: '#161917',
    fontSize: 10,
    fontFamily: 'monospace',
    backgroundColor: '#D4E2F8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  qaDiffTag: {
    color: '#92400E',
    fontSize: 10,
    fontFamily: 'monospace',
    backgroundColor: '#FCE8A6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  qaQuestionPrompt: {
    color: '#161917',
    fontSize: 15,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  qaRevealButton: {
    backgroundColor: '#161917',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 6,
  },
  qaRevealButtonActive: {
    backgroundColor: '#F0F1EC',
    borderWidth: 1,
    borderColor: '#E2E3DC',
  },
  qaRevealButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  qaSolutionContainer: {
    backgroundColor: '#F0F1EC',
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  qaSolutionLabel: {
    color: '#0D381E',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  qaSolutionBody: {
    color: '#161917',
    fontSize: 13,
    lineHeight: 20,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E3DC',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#161917',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emptyText: {
    color: '#8E928C',
    fontSize: 12,
    textAlign: 'center',
  },

  // Topic Details & Material
  topicDetailTitle: {
    color: '#161917',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  topicDetailDesc: {
    color: '#70746E',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 8,
    lineHeight: 18,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusPillComplete: {
    backgroundColor: '#9DE8BA',
  },
  statusPillTodo: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E3DC',
  },
  statusPillText: {
    color: '#161917',
    fontSize: 11,
    fontWeight: 'bold',
  },
  topicRowCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E3DC',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkIconBtn: {
    padding: 4,
  },
  checkIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkDone: {
    color: '#161917',
  },
  checkTodo: {
    color: '#CBD5E1',
  },
  topicTitle: {
    color: '#161917',
    fontSize: 14,
    fontWeight: 'bold',
  },
  topicTitleDone: {
    color: '#8E928C',
    textDecorationLine: 'line-through',
  },
  topicSummary: {
    color: '#70746E',
    fontSize: 12,
    marginTop: 2,
  },
  arrowIcon: {
    color: '#8E928C',
    fontSize: 18,
  },
  materialCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E3DC',
    borderRadius: 20,
    padding: 18,
    gap: 8,
  },
  materialTitle: {
    color: '#161917',
    fontSize: 14,
    fontWeight: 'bold',
  },
  materialContent: {
    color: '#262927',
    fontSize: 12,
    lineHeight: 19,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E3DC',
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  questionNum: {
    color: '#161917',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  badgeSmall: {
    color: '#161917',
    fontSize: 10,
    fontFamily: 'monospace',
    backgroundColor: '#FCE8A6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: 'bold',
  },
  questionText: {
    color: '#161917',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  revealBtn: {
    marginTop: 4,
  },
  revealBtnText: {
    color: '#161917',
    fontSize: 11,
    fontWeight: 'bold',
  },
  solutionBox: {
    backgroundColor: '#F0F1EC',
    borderRadius: 14,
    padding: 12,
    marginTop: 6,
  },
  solutionText: {
    color: '#262927',
    fontSize: 12,
    lineHeight: 18,
  },

  // Floating Bottom Menu Bar Island
  bottomNavIsland: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 12,
  },
  navSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navSlotPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 18,
    minWidth: 50,
  },
  navSlotActiveDark: {
    backgroundColor: '#202422',
  },
  navSlotActiveLight: {
    backgroundColor: '#F0F1EC',
  },
  navIconText: {
    fontSize: 16,
    marginBottom: 2,
    fontWeight: '600',
  },
  navIconActiveDark: {
    color: '#9DE8BA',
  },
  navIconActiveLight: {
    color: '#161917',
  },
  navLabel: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  navLabelActiveDark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  navLabelActiveLight: {
    color: '#161917',
    fontWeight: 'bold',
  },
  navLabelInactiveDark: {
    color: '#767C77',
  },
  navLabelInactiveLight: {
    color: '#8E928C',
  },

  // Center Home Hub Button
  navCenterHubSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  navCenterHubBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  navCenterHubActiveDark: {
    backgroundColor: '#9DE8BA',
  },
  navCenterHubActiveLight: {
    backgroundColor: '#161917',
  },
  navCenterHubInactiveDark: {
    backgroundColor: '#202422',
    borderWidth: 1,
    borderColor: '#2E3330',
  },
  navCenterHubInactiveLight: {
    backgroundColor: '#F0F1EC',
    borderWidth: 1,
    borderColor: '#E2E3DC',
  },
  navCenterHubIcon: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: -2,
  },
  navCenterHubIconActiveDark: {
    color: '#0D381E',
  },
  navCenterHubIconActiveLight: {
    color: '#FFFFFF',
  },
  navCenterHubIconInactiveDark: {
    color: '#D1D5DB',
  },
  navCenterHubIconInactiveLight: {
    color: '#161917',
  },

  // Quick Action Pop-up Dock
  quickHubOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 99,
  },
  quickHubCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 16,
  },
  quickHubHandleBar: {
    alignItems: 'center',
    marginBottom: 2,
  },
  quickHubHandlePill: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  quickHubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  quickHubHeaderDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  quickHubHeaderTitle: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  quickHubSectionTag: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginBottom: -4,
  },
  quickHubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickHubItem: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 2,
  },
  quickHubIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  quickHubLabel: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  quickHubSub: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  quickHubShortcutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickHubShortcutBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
  },
  quickHubShortcutIcon: {
    fontSize: 16,
  },
  quickHubShortcutLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },

  // Profile & Settings Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(22, 25, 23, 0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1EC',
    paddingBottom: 16,
    marginBottom: 16,
  },
  modalUserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#161917',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAvatarText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  modalUserName: {
    color: '#161917',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalUserEmail: {
    color: '#70746E',
    fontSize: 12,
  },
  modalCloseBtn: {
    padding: 8,
  },
  modalCloseBtnText: {
    color: '#70746E',
    fontSize: 18,
  },
  modalSectionLabel: {
    color: '#70746E',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 8,
  },
  topBrandLogoImage: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  logoPickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  logoPickerCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E3DC',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  logoPickerTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2,
  },
  logoPickerSub: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    color: '#70746E',
  },
  logoActiveCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#161917',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickSwitchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickSwitchBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F0F1EC',
    borderWidth: 1,
    borderColor: '#E2E3DC',
    alignItems: 'center',
  },
  quickSwitchBtnActive: {
    backgroundColor: '#161917',
    borderColor: '#161917',
  },
  quickSwitchText: {
    color: '#161917',
    fontSize: 12,
    fontWeight: 'bold',
  },
  authBox: {
    backgroundColor: '#F0F1EC',
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  authInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E3DC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#161917',
    fontSize: 13,
  },
  authSubmitBtn: {
    backgroundColor: '#161917',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  authSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  authToggleText: {
    color: '#161917',
    fontSize: 11,
    fontWeight: '600',
  },
  byokButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  byokTestBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E3DC',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  byokTestBtnText: {
    color: '#161917',
    fontSize: 11,
    fontWeight: 'bold',
  },
  byokSaveBtn: {
    flex: 1,
    backgroundColor: '#161917',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  byokSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  testResultText: {
    color: '#0D381E',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },

  // Senior UI & Self-Analytics
  offlineIconBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFE4E6',
    marginBottom: 8,
  },
  offlineIconText: {
    color: '#BE123C',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  lockedTagBox: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F1EC',
    marginBottom: 10,
  },
  lockedTagBoxText: {
    color: '#70746E',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  analyticsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recalcBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#161917',
    borderRadius: 20,
  },
  recalcBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  telemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  telemetryCard: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 112,
  },
  telemetryLabel: {
    color: '#262927',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  telemetryValue: {
    color: '#161917',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  telemetrySubtext: {
    color: '#4A4F4A',
    fontSize: 11,
    fontWeight: '500',
  },
  textEmerald: {
    color: '#0D381E',
  },
  pacingToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F1EC',
    borderRadius: 24,
    padding: 4,
    marginTop: 10,
    marginBottom: 10,
  },
  pacingToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  pacingToggleBtnActive: {
    backgroundColor: '#161917',
  },
  pacingToggleText: {
    color: '#70746E',
    fontSize: 11,
    fontWeight: '600',
  },
  pacingToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  pacingDetailsBox: {
    backgroundColor: '#F0F1EC',
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  pacingDetailLabel: {
    color: '#70746E',
    fontSize: 11,
  },
  pacingDetailValue: {
    color: '#161917',
    fontSize: 12,
    fontWeight: 'bold',
  },
  strugglingCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  strugglingCardHigh: {
    borderColor: '#FDA4AF',
    backgroundColor: '#FFF1F2',
  },
  strugglingCardMod: {
    borderColor: '#FDE047',
    backgroundColor: '#FEFCE8',
  },
  strugglingCardTrack: {
    borderColor: '#E2E3DC',
  },
  urgencyBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgencyHigh: {
    color: '#881337',
    backgroundColor: '#FFE4E6',
  },
  urgencyMod: {
    color: '#713F12',
    backgroundColor: '#FEF08A',
  },
  urgencyTrack: {
    color: '#064E3B',
    backgroundColor: '#CDE9D6',
  },
  strugglingTitle: {
    color: '#161917',
    fontSize: 15,
    fontWeight: 'bold',
  },
  strugglingRec: {
    color: '#4A4F4A',
    fontSize: 12,
    lineHeight: 18,
  },
  focusAreaBtn: {
    backgroundColor: '#161917',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  focusAreaBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  badgeSuccess: {
    backgroundColor: '#CDE9D6',
    color: '#064E3B',
  },
  badgeLocked: {
    backgroundColor: '#F0F1EC',
    color: '#70746E',
  },
  progressRowContainer: {
    gap: 4,
    marginTop: 6,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E2E3DC',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#161917',
    borderRadius: 3,
  },
  progressBarFillEmerald: {
    backgroundColor: '#9DE8BA',
  },
  blockingBox: {
    backgroundColor: '#F0F1EC',
    borderRadius: 16,
    padding: 12,
    marginTop: 10,
    gap: 4,
  },
  blockingHeader: {
    color: '#92400E',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  blockingItemText: {
    color: '#262927',
    fontSize: 11,
  },
  analyticsModuleCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E3DC',
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  analyticsTitle: {
    color: '#161917',
    fontSize: 13,
    fontWeight: 'bold',
  },
  analyticsStatus: {
    color: '#70746E',
    fontSize: 11,
  },
  activityItem: {
    color: '#4A4F4A',
    fontSize: 12,
    marginVertical: 4,
  },
});

