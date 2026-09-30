import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MobileApi, MobileUser } from '../services/api';
import {
  SunIcon,
  MoonIcon,
  UserIcon,
  LockIcon,
  MailIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  CheckIcon,
  ZapIcon,
} from '../components/VectorIcons';

const logoDark = require('../../assets/logo-dark.png');
const logoLight = require('../../assets/logo-light.png');

interface AuthScreenProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onAuthSuccess: (user: MobileUser) => void;
  onCancel?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  theme,
  onToggleTheme,
  onAuthSuccess,
  onCancel,
}) => {
  const insets = useSafeAreaInsets();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sign In / General
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up
  const [fullName, setFullName] = useState('');
  const [customUsername, setCustomUsername] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('data_science');

  // Password Reset Step
  const [resetVerified, setResetVerified] = useState(false);
  const [verifiedTarget, setVerifiedTarget] = useState('');

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSignIn = async () => {
    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage('Please enter both your username/email and password.');
      return;
    }
    setIsLoading(true);
    clearMessages();
    try {
      const res = await MobileApi.login(usernameOrEmail.trim(), password);
      onAuthSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Incorrect credentials. Check username or try 1-Click Dev Mode.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Please enter an email and password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    setIsLoading(true);
    clearMessages();
    try {
      const res = await MobileApi.register(
        email.trim(),
        password,
        fullName.trim() || undefined,
        customUsername.trim() || undefined
      );
      // Save chosen track into student profile
      await MobileApi.updateOnboarding({ selected_domain: selectedTrack });
      onAuthSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Email or username might already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!usernameOrEmail.trim()) {
      setErrorMessage('Please enter your username or registered email.');
      return;
    }
    setIsLoading(true);
    clearMessages();
    try {
      const res = await MobileApi.forgotPassword(usernameOrEmail.trim());
      setSuccessMessage(res.message);
      if (res.user_exists) {
        setResetVerified(true);
        setVerifiedTarget(res.username || usernameOrEmail.trim());
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Account lookup failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password) {
      setErrorMessage('Please enter a new password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    setIsLoading(true);
    clearMessages();
    try {
      const res = await MobileApi.resetPassword(verifiedTarget || usernameOrEmail.trim(), password);
      Alert.alert('Password Updated', 'Your password was reset successfully. Welcome back!');
      onAuthSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not update password. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDevUser = async (userKey: 'user1' | 'user2') => {
    setIsLoading(true);
    clearMessages();
    try {
      const res = await MobileApi.login(userKey, 'password123');
      onAuthSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(`Failed to sign in as ${userKey}. Ensure backend is running.`);
    } finally {
      setIsLoading(false);
    }
  };

  const activeLogo = isDark ? logoDark : logoLight;

  return (
    <View style={[styles.container, isDark ? styles.darkContainer : styles.lightContainer]}>
      {/* Top Header with Official App Logo */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <Image
            source={activeLogo}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
            <View style={styles.brandRow}>
              <Text style={[styles.brandTitle, isDark && styles.textWhite]}>LIFT</Text>
              <View style={[styles.pillBadge, isDark ? styles.pillBadgeDark : styles.pillBadgeLight]}>
                <Text style={[styles.pillBadgeText, isDark ? styles.textMint : styles.textDarkGreen]}>
                  BM1 → TOI
                </Text>
              </View>
            </View>
            <Text style={[styles.brandSubtitle, isDark ? styles.textMutedDark : styles.textMutedLight]}>
              Engineering Workspace
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={onToggleTheme}
            style={[styles.iconButton, isDark ? styles.iconButtonDark : styles.iconButtonLight]}
            activeOpacity={0.7}
          >
            {isDark ? (
              <SunIcon size={18} color="#9DE8BA" />
            ) : (
              <MoonIcon size={18} color="#70746E" />
            )}
          </TouchableOpacity>

          {onCancel && (
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.cancelButton, isDark ? styles.cancelButtonDark : styles.cancelButtonLight]}
            >
              <Text style={[styles.cancelText, isDark ? styles.textWhite : styles.textBlack]}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={[styles.scrollInner, { paddingBottom: insets.bottom + 30 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Pitch */}
          <View style={styles.heroSection}>
            <View style={[styles.statusTag, isDark ? styles.statusTagDark : styles.statusTagLight]}>
              <View style={styles.statusDot} />
              <Text style={[styles.statusTagText, isDark ? styles.textMint : styles.textDarkGreen]}>
                Offline Local Storage Synced
              </Text>
            </View>
            <Text style={[styles.heroHeading, isDark && styles.textWhite]}>
              Master engineering with{' '}
              <Text style={{ color: '#9DE8BA' }}>unbroken focus.</Text>
            </Text>
            <Text style={[styles.heroDescription, isDark ? styles.textMutedDark : styles.textMutedLight]}>
              Track syllabus topics, practice questions, and sync offline tasks seamlessly.
            </Text>
          </View>

          {/* 1-Click Developer Mode Card */}
          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardTitleGroup}>
                <ZapIcon size={16} color={isDark ? '#9DE8BA' : '#0D381E'} />
                <Text style={[styles.cardTitle, isDark && styles.textWhite]}>
                  1-Click Dev Personas
                </Text>
              </View>
              <Text style={[styles.devBadge, isDark ? styles.devBadgeDark : styles.devBadgeLight]}>
                DEV MODE
              </Text>
            </View>
            <Text style={[styles.cardSubtitle, isDark ? styles.textMutedDark : styles.textMutedLight]}>
              Tap below to sign in instantly without typing credentials:
            </Text>

            <View style={styles.personaRow}>
              <TouchableOpacity
                onPress={() => handleQuickDevUser('user1')}
                disabled={isLoading}
                activeOpacity={0.7}
                style={[styles.personaButton, isDark ? styles.personaButtonDark : styles.personaButtonLight]}
              >
                <View style={[styles.personaAvatar, { backgroundColor: isDark ? '#1C2921' : '#E8F5E9' }]}>
                  <Text style={[styles.personaAvatarText, { color: isDark ? '#9DE8BA' : '#1B5E20' }]}>NB</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.personaName, isDark && styles.textWhite]}>Nivin Benny</Text>
                  <Text style={[styles.personaRole, isDark ? styles.textMutedDark : styles.textMutedLight]}>
                    BM1 Lead (user1)
                  </Text>
                </View>
                <ArrowRightIcon size={14} color={isDark ? '#9DE8BA' : '#70746E'} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleQuickDevUser('user2')}
                disabled={isLoading}
                activeOpacity={0.7}
                style={[styles.personaButton, isDark ? styles.personaButtonDark : styles.personaButtonLight]}
              >
                <View style={[styles.personaAvatar, { backgroundColor: isDark ? '#1C2529' : '#E0F7FA' }]}>
                  <Text style={[styles.personaAvatarText, { color: isDark ? '#80DEEA' : '#006064' }]}>SP</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.personaName, isDark && styles.textWhite]}>Study Partner</Text>
                  <Text style={[styles.personaRole, isDark ? styles.textMutedDark : styles.textMutedLight]}>
                    Partner (user2)
                  </Text>
                </View>
                <ArrowRightIcon size={14} color={isDark ? '#9DE8BA' : '#70746E'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={[styles.tabBar, isDark ? styles.tabBarDark : styles.tabBarLight, { marginTop: 14 }]}>
            <TouchableOpacity
              onPress={() => {
                setMode('signin');
                clearMessages();
              }}
              style={[styles.tabItem, mode === 'signin' && (isDark ? styles.tabActiveDark : styles.tabActiveLight)]}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === 'signin'
                    ? (isDark ? styles.textWhite : styles.textBlack)
                    : (isDark ? styles.textMutedDark : styles.textMutedLight),
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setMode('signup');
                clearMessages();
              }}
              style={[styles.tabItem, mode === 'signup' && (isDark ? styles.tabActiveDark : styles.tabActiveLight)]}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === 'signup'
                    ? (isDark ? styles.textWhite : styles.textBlack)
                    : (isDark ? styles.textMutedDark : styles.textMutedLight),
                ]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setMode('forgot');
                clearMessages();
              }}
              style={[styles.tabItem, mode === 'forgot' && (isDark ? styles.tabActiveDark : styles.tabActiveLight)]}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === 'forgot'
                    ? (isDark ? styles.textWhite : styles.textBlack)
                    : (isDark ? styles.textMutedDark : styles.textMutedLight),
                ]}
              >
                Reset Pass
              </Text>
            </TouchableOpacity>
          </View>

          {/* Feedback Banners */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          {successMessage && (
            <View style={styles.successBanner}>
              <Text style={styles.successBannerText}>{successMessage}</Text>
            </View>
          )}

          {/* DIFFERENTIATED CARD 1: SIGN IN */}
          {mode === 'signin' && (
            <View
              style={[
                styles.card,
                isDark ? styles.cardDark : styles.cardLight,
                { borderColor: isDark ? 'rgba(157, 232, 186, 0.3)' : '#81C784', borderWidth: 1.5 },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardTitleGroup}>
                  <View style={[styles.modeIconCircle, { backgroundColor: isDark ? 'rgba(157, 232, 186, 0.15)' : '#E8F5E9' }]}>
                    <LockIcon size={16} color={isDark ? '#9DE8BA' : '#1B5E20'} />
                  </View>
                  <View>
                    <Text style={[styles.cardTitle, isDark && styles.textWhite]}>
                      Welcome Back
                    </Text>
                    <Text style={[styles.cardSubtitle, isDark ? styles.textMutedDark : styles.textMutedLight]}>
                      Sign in to resume BM1 tasks & progress
                    </Text>
                  </View>
                </View>
                <View style={[styles.diffBadge, { backgroundColor: isDark ? '#202422' : '#F0F1EC' }]}>
                  <Text style={[styles.diffBadgeText, isDark ? styles.textMint : styles.textDarkGreen]}>ACCESS</Text>
                </View>
              </View>

              <View style={styles.formContainer}>
                <Text style={[styles.inputLabel, isDark && styles.textMutedDark]}>
                  USERNAME OR EMAIL
                </Text>
                <View style={[styles.inputWrapper, isDark ? styles.inputWrapperDark : styles.inputWrapperLight]}>
                  <UserIcon size={16} color={isDark ? '#888F89' : '#70746E'} />
                  <TextInput
                    style={[styles.textInput, isDark && styles.textWhite]}
                    placeholder="e.g. user1 or nivin@example.com"
                    placeholderTextColor={isDark ? '#6B726C' : '#9CA3AF'}
                    value={usernameOrEmail}
                    onChangeText={setUsernameOrEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.labelRow}>
                  <Text style={[styles.inputLabel, isDark && styles.textMutedDark]}>
                    PASSWORD
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setMode('forgot');
                      clearMessages();
                    }}
                  >
                    <Text style={styles.forgotLink}>Forgot?</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.inputWrapper, isDark ? styles.inputWrapperDark : styles.inputWrapperLight]}>
                  <LockIcon size={16} color={isDark ? '#888F89' : '#70746E'} />
                  <TextInput
                    style={[styles.textInput, isDark && styles.textWhite]}
                    placeholder="••••••••••••"
                    placeholderTextColor={isDark ? '#6B726C' : '#9CA3AF'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {showPassword ? (
                      <EyeOffIcon size={16} color={isDark ? '#888F89' : '#70746E'} />
                    ) : (
                      <EyeIcon size={16} color={isDark ? '#888F89' : '#70746E'} />
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleSignIn}
                  disabled={isLoading}
                  style={[styles.submitButton, isDark ? styles.submitButtonDark : styles.submitButtonLight]}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={isDark ? '#0D381E' : '#FFFFFF'} />
                  ) : (
                    <>
                      <Text style={[styles.submitButtonText, isDark ? styles.submitTextDark : styles.submitTextLight]}>
                        Sign In to LIFT Workspace
                      </Text>
                      <ArrowRightIcon size={16} color={isDark ? '#0D381E' : '#FFFFFF'} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* DIFFERENTIATED CARD 2: SIGN UP */}
          {mode === 'signup' && (
            <View
              style={[
                styles.card,
                isDark ? styles.cardDark : styles.cardLight,
                { borderColor: isDark ? 'rgba(77, 208, 225, 0.3)' : '#4DD0E1', borderWidth: 1.5 },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardTitleGroup}>
                  <View style={[styles.modeIconCircle, { backgroundColor: isDark ? 'rgba(77, 208, 225, 0.15)' : '#E0F7FA' }]}>
                    <UserIcon size={16} color={isDark ? '#80DEEA' : '#006064'} />
                  </View>
                  <View>
                    <Text style={[styles.cardTitle, isDark && styles.textWhite]}>
                      Create Student Account
                    </Text>
                    <Text style={[styles.cardSubtitle, isDark ? styles.textMutedDark : styles.textMutedLight]}>
                      Enrolls in BM1 curriculum with local storage
                    </Text>
                  </View>
                </View>
                <View style={[styles.diffBadge, { backgroundColor: isDark ? '#202422' : '#F0F1EC' }]}>
                  <Text style={[styles.diffBadgeText, { color: isDark ? '#80DEEA' : '#006064' }]}>NEW</Text>
                </View>
              </View>

              <View style={styles.formContainer}>
                {/* Track Picker Preview */}
                <Text style={[styles.inputLabel, isDark && styles.textMutedDark]}>CHOSEN CURRICULUM TRACK</Text>
                <View style={[styles.trackBox, isDark ? styles.trackBoxDark : styles.trackBoxLight]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.trackName, isDark && styles.textWhite]}>
                      Data Science & Analytics
                    </Text>
                    <Text style={[styles.trackSub, isDark ? styles.textMutedDark : styles.textMutedLight]}>
                      BM1 → BM2 → TOI Active Benchmark Track
                    </Text>
                  </View>
                  <View style={[styles.livePill, isDark ? styles.livePillDark : styles.livePillLight]}>
                    <Text style={[styles.livePillText, isDark ? styles.textMint : styles.textDarkGreen]}>LIVE</Text>
                  </View>
                </View>

                <Text style={[styles.inputLabel, isDark && styles.textMutedDark]}>FULL NAME (OPTIONAL)</Text>
                <View style={[styles.inputWrapper, isDark ? styles.inputWrapperDark : styles.inputWrapperLight]}>
                  <UserIcon size={16} color={isDark ? '#888F89' : '#70746E'} />
                  <TextInput
                    style={[styles.textInput, isDark && styles.textWhite]}
                    placeholder="e.g. Nivin Benny"
                    placeholderTextColor={isDark ? '#6B726C' : '#9CA3AF'}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>

                <Text style={[styles.inputLabel, isDark && styles.textMutedDark]}>USERNAME *</Text>
                <View style={[styles.inputWrapper, isDark ? styles.inputWrapperDark : styles.inputWrapperLight]}>
                  <UserIcon size={16} color={isDark ? '#888F89' : '#70746E'} />
                  <TextInput
                    style={[styles.textInput, isDark && styles.textWhite]}
                    placeholder="e.g. nivin24"
                    placeholderTextColor={isDark ? '#6B726C' : '#9CA3AF'}
                    value={customUsername}
                    onChangeText={setCustomUsername}
                    autoCapitalize="none"
                  />
                </View>

                <Text style={[styles.inputLabel, isDark && styles.textMutedDark]}>EMAIL ADDRESS *</Text>
                <View style={[styles.inputWrapper, isDark ? styles.inputWrapperDark : styles.inputWrapperLight]}>
                  <MailIcon size={16} color={isDark ? '#888F89' : '#70746E'} />
                  <TextInput
                    style={[styles.textInput, isDark && styles.textWhite]}
                    placeholder="nivin@example.com"
                    placeholderTextColor={isDark ? '#6B726C' : '#9CA3AF'}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <Text style={[styles.inputLabel, isDark && styles.textMutedDark]}>PASSWORD (MIN 6 CHARACTERS) *</Text>
                <View style={[styles.inputWrapper, isDark ? styles.inputWrapperDark : styles.inputWrapperLight]}>
                  <LockIcon size={16} color={isDark ? '#888F89' : '#70746E'} />
                  <TextInput
                    style={[styles.textInput, isDark && styles.textWhite]}
                    placeholder="••••••••••••"
                    placeholderTextColor={isDark ? '#6B726C' : '#9CA3AF'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <Text style={[styles.inputLabel, isDark && styles.textMutedDark]}>CONFIRM PASSWORD *</Text>
                <View style={[styles.inputWrapper, isDark ? styles.inputWrapperDark : styles.inputWrapperLight]}>
                  <LockIcon size={16} color={isDark ? '#888F89' : '#70746E'} />
                  <TextInput
                    style={[styles.textInput, isDark && styles.textWhite]}
                    placeholder="Repeat password"
                    placeholderTextColor={isDark ? '#6B726C' : '#9CA3AF'}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSignUp}
                  disabled={isLoading}
                  style={[styles.submitButton, isDark ? styles.submitButtonDark : styles.submitButtonLight]}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={isDark ? '#0D381E' : '#FFFFFF'} />
                  ) : (
                    <>
                      <Text style={[styles.submitButtonText, isDark ? styles.submitTextDark : styles.submitTextLight]}>
                        Create Account & Launch
                      </Text>
                      <ArrowRightIcon size={16} color={isDark ? '#0D381E' : '#FFFFFF'} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* DIFFERENTIATED CARD 3: RESET PASSWORD */}
          {mode === 'forgot' && (
            <View
              style={[
                styles.card,
                isDark ? styles.cardDark : styles.cardLight,
                { borderColor: isDark ? 'rgba(255, 183, 77, 0.3)' : '#FFB74D', borderWidth: 1.5 },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardTitleGroup}>
                  <View style={[styles.modeIconCircle, { backgroundColor: isDark ? 'rgba(255, 183, 77, 0.15)' : '#FFF3E0' }]}>
                    <LockIcon size={16} color={isDark ? '#FFB74D' : '#E65100'} />
                  </View>
                  <View>
                    <Text style={[styles.cardTitle, isDark && styles.textWhite]}>
                      Account Recovery
                    </Text>
                    <Text style={[styles.cardSubtitle, isDark ? styles.textMutedDark : styles.textMutedLight]}>
                      Verify your account to set a new password
                    </Text>
                  </View>
                </View>
                <View style={[styles.diffBadge, { backgroundColor: isDark ? '#202422' : '#F0F1EC' }]}>
                  <Text style={[styles.diffBadgeText, { color: isDark ? '#FFB74D' : '#E65100' }]}>RECOVERY</Text>
                </View>
              </View>

              <View style={styles.formContainer}>
                {!resetVerified ? (
                  <>
                    <Text style={[styles.cardSubtitle, isDark ? styles.textMutedDark : styles.textMutedLight]}>
                      Step 1 of 2: Enter your username or email address. We will verify your account profile immediately.
                    </Text>

                    <Text style={[styles.inputLabel, isDark && styles.textMutedDark]}>
                      USERNAME OR EMAIL
                    </Text>
                    <View style={[styles.inputWrapper, isDark ? styles.inputWrapperDark : styles.inputWrapperLight]}>
                      <MailIcon size={16} color={isDark ? '#888F89' : '#70746E'} />
                      <TextInput
                        style={[styles.textInput, isDark && styles.textWhite]}
                        placeholder="e.g. user1 or nivin@example.com"
                        placeholderTextColor={isDark ? '#6B726C' : '#9CA3AF'}
                        value={usernameOrEmail}
                        onChangeText={setUsernameOrEmail}
                        autoCapitalize="none"
                      />
                    </View>

                    <TouchableOpacity
                      onPress={handleForgotPassword}
                      disabled={isLoading}
                      style={[styles.submitButton, isDark ? styles.submitButtonDark : styles.submitButtonLight]}
                      activeOpacity={0.8}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color={isDark ? '#0D381E' : '#FFFFFF'} />
                      ) : (
                        <>
                          <Text style={[styles.submitButtonText, isDark ? styles.submitTextDark : styles.submitTextLight]}>
                            Verify Identity
                          </Text>
                          <ArrowRightIcon size={16} color={isDark ? '#0D381E' : '#FFFFFF'} />
                        </>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.successBanner}>
                      <Text style={styles.successBannerText}>
                        Identity verified for {verifiedTarget}. Step 2 of 2: Set your new password:
                      </Text>
                    </View>

                    <Text style={[styles.inputLabel, isDark && styles.textMutedDark]}>
                      NEW PASSWORD *
                    </Text>
                    <View style={[styles.inputWrapper, isDark ? styles.inputWrapperDark : styles.inputWrapperLight]}>
                      <LockIcon size={16} color={isDark ? '#888F89' : '#70746E'} />
                      <TextInput
                        style={[styles.textInput, isDark && styles.textWhite]}
                        placeholder="At least 6 characters"
                        placeholderTextColor={isDark ? '#6B726C' : '#9CA3AF'}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                      />
                    </View>

                    <Text style={[styles.inputLabel, isDark && styles.textMutedDark]}>
                      CONFIRM NEW PASSWORD *
                    </Text>
                    <View style={[styles.inputWrapper, isDark ? styles.inputWrapperDark : styles.inputWrapperLight]}>
                      <LockIcon size={16} color={isDark ? '#888F89' : '#70746E'} />
                      <TextInput
                        style={[styles.textInput, isDark && styles.textWhite]}
                        placeholder="Repeat new password"
                        placeholderTextColor={isDark ? '#6B726C' : '#9CA3AF'}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        autoCapitalize="none"
                      />
                    </View>

                    <TouchableOpacity
                      onPress={handleResetPassword}
                      disabled={isLoading}
                      style={[styles.submitButton, isDark ? styles.submitButtonDark : styles.submitButtonLight]}
                      activeOpacity={0.8}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color={isDark ? '#0D381E' : '#FFFFFF'} />
                      ) : (
                        <>
                          <Text style={[styles.submitButtonText, isDark ? styles.submitTextDark : styles.submitTextLight]}>
                            Update Password & Enter
                          </Text>
                          <CheckIcon size={16} color={isDark ? '#0D381E' : '#FFFFFF'} />
                        </>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkContainer: {
    backgroundColor: '#0B0D0C',
  },
  lightContainer: {
    backgroundColor: '#F0F1EC',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#262A27',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '900',
    fontSize: 16,
    color: '#161917',
    letterSpacing: 0.5,
  },
  pillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pillBadgeDark: {
    backgroundColor: 'rgba(157, 232, 186, 0.15)',
    borderColor: 'rgba(157, 232, 186, 0.3)',
    borderWidth: 1,
  },
  pillBadgeLight: {
    backgroundColor: '#E8F5E9',
  },
  pillBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  brandSubtitle: {
    fontSize: 11,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconButtonDark: {
    backgroundColor: '#161917',
    borderColor: '#262A27',
  },
  iconButtonLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D5D8D0',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  cancelButtonDark: {
    backgroundColor: '#202422',
  },
  cancelButtonLight: {
    backgroundColor: '#E5E8E0',
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroSection: {
    marginBottom: 16,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
  },
  statusTagDark: {
    backgroundColor: 'rgba(157, 232, 186, 0.1)',
    borderColor: 'rgba(157, 232, 186, 0.25)',
  },
  statusTagLight: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9DE8BA',
  },
  statusTagText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
  },
  heroHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#161917',
    lineHeight: 28,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  heroDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  cardDark: {
    backgroundColor: '#161917',
    borderColor: '#262A27',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E8E0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#161917',
  },
  cardSubtitle: {
    fontSize: 11,
    lineHeight: 15,
  },
  diffBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  diffBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 9,
    fontWeight: '800',
  },
  devBadge: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  devBadgeDark: {
    backgroundColor: '#202422',
    color: '#9DE8BA',
  },
  devBadgeLight: {
    backgroundColor: '#F0F1EC',
    color: '#161917',
  },
  personaRow: {
    gap: 8,
  },
  personaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  personaButtonDark: {
    backgroundColor: '#202422',
    borderColor: '#2E3330',
  },
  personaButtonLight: {
    backgroundColor: '#F7F8F5',
    borderColor: '#E5E8E0',
  },
  personaAvatar: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personaAvatarText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '800',
    fontSize: 12,
  },
  personaName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#161917',
  },
  personaRole: {
    fontSize: 11,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 12,
    marginBottom: 14,
  },
  tabBarDark: {
    backgroundColor: '#202422',
  },
  tabBarLight: {
    backgroundColor: '#F0F1EC',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActiveDark: {
    backgroundColor: '#161917',
  },
  tabActiveLight: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  formContainer: {
    gap: 8,
  },
  trackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 4,
  },
  trackBoxDark: {
    backgroundColor: '#202422',
    borderColor: '#2E3330',
  },
  trackBoxLight: {
    backgroundColor: '#F7F8F5',
    borderColor: '#D5D8D0',
  },
  trackName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#161917',
  },
  trackSub: {
    fontSize: 10,
  },
  livePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  livePillDark: {
    backgroundColor: 'rgba(157, 232, 186, 0.2)',
  },
  livePillLight: {
    backgroundColor: '#E8F5E9',
  },
  livePillText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 9,
    fontWeight: '800',
  },
  inputLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10,
    fontWeight: '700',
    color: '#70746E',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  forgotLink: {
    fontSize: 11,
    color: '#9DE8BA',
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  inputWrapperDark: {
    backgroundColor: '#202422',
    borderColor: '#2E3330',
  },
  inputWrapperLight: {
    backgroundColor: '#F7F8F5',
    borderColor: '#D5D8D0',
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#161917',
    paddingVertical: 0,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 14,
    gap: 8,
    marginTop: 10,
  },
  submitButtonDark: {
    backgroundColor: '#9DE8BA',
  },
  submitButtonLight: {
    backgroundColor: '#161917',
  },
  submitButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  submitTextDark: {
    color: '#0D381E',
  },
  submitTextLight: {
    color: '#FFFFFF',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  errorBannerText: {
    color: '#EF4444',
    fontSize: 12,
    lineHeight: 16,
  },
  successBanner: {
    backgroundColor: 'rgba(157, 232, 186, 0.15)',
    borderColor: 'rgba(157, 232, 186, 0.35)',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  successBannerText: {
    color: '#9DE8BA',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textBlack: {
    color: '#161917',
  },
  textMint: {
    color: '#9DE8BA',
  },
  textDarkGreen: {
    color: '#0D381E',
  },
  textMutedDark: {
    color: '#A3AAA4',
  },
  textMutedLight: {
    color: '#70746E',
  },
});
