import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Platform,
  Image,
  Linking,
  Switch,
  Pressable
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useRecipes } from '../context/RecipeContext';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '../components/PageHeader';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function AboutScreen({ route }) {
  const navigation = useNavigation();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { openAddRecipe } = useRecipes();

  // Navigation sub-views: 'main' | 'mobile' | 'documentation' | 'changelog' | 'privacy'
  const initialView = route?.params?.view || 'main';
  const [currentView, setCurrentView] = useState(initialView);
  
  // Docs sub-tabs: 'overview' | 'features' | 'architecture'
  const [docTab, setDocTab] = useState('overview');

  // Mobile App sub-tabs: 'android' | 'ios'
  const [appPlatform, setAppPlatform] = useState('android');

  // Changelog sub-tabs: 'mobile' | 'website'
  const [changelogTab, setChangelogTab] = useState('mobile');

  // Accordion open states for FAQ
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [expandedThanks, setExpandedThanks] = useState(false);

  const handleBack = () => {
    if (currentView !== 'main') {
      setCurrentView('main');
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(user ? 'MainTabs' : 'Login', user ? { screen: 'Home' } : undefined);
    }
  };

  const handleDownloadAPK = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const link = document.createElement('a');
        link.href = '/download/chefstack.apk';
        link.setAttribute('download', 'chefstack.apk');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        window.open('/download/chefstack.apk', '_blank');
      }
    } else {
      Linking.openURL('https://chef-stack.vercel.app/download/chefstack.apk').catch(() => {
        alert('Downloading ChefStack APK v1.3.0...');
      });
    }
  };

  const toggleFaqItem = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header Bar */}
      <PageHeader 
        title={currentView === 'main' ? 'About ChefStack' : currentView === 'mobile' ? 'Mobile App' : currentView === 'documentation' ? 'Technical Docs' : currentView === 'changelog' ? 'Changelog' : 'Privacy Policy'}
        subtitle="Version 1.3.0"
        icon="information-circle-outline"
        onBack={handleBack}
        maxWidth={720}
        rightComponent={
          currentView !== 'main' ? (
            <TouchableOpacity style={[styles.backToAboutPill, { backgroundColor: colors.primary + '15' }]} onPress={() => setCurrentView('main')}>
              <Ionicons name="chevron-back" size={16} color={colors.primary} />
              <Text style={[styles.backToAboutText, { color: colors.primary }]}>Back</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.maxWidthContainer}>

          {/* ========================================================================= */}
          {/* VIEW 1: MAIN ABOUT LANDING PAGE (Matches Tarakape /about screenshots)     */}
          {/* ========================================================================= */}
          {currentView === 'main' && (
            <Animated.View entering={FadeInDown.duration(400)}>
              
              {/* Section 1: Main Brand Hero & Link Cards */}
              <View style={[styles.cardSection, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <View style={styles.brandHeaderRow}>
                  <View style={[styles.brandLogoBg, { backgroundColor: colors.primary + '15' }]}>
                    <Image 
                      source={require('../../assets/chefstack_logo.png')} 
                      style={{ width: 36, height: 36, borderRadius: 10 }} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.brandTitleText, { color: colors.text }]}>Ano, ChefStack?</Text>
                    <Text style={[styles.brandTaglineText, { color: colors.primary }]}>DISCOVER • COOK • ENJOY</Text>
                  </View>
                </View>

                <Text style={[styles.brandDescriptionText, { color: colors.textSecondary }]}>
                  ChefStack is a modern recipe finder and manager platform designed to help home cooks discover premium, aesthetic, and delicious culinary creations. Find your perfect recipe, navigate cooking steps seamlessly, and save for offline use.
                </Text>

                <View style={[styles.statusNoticeBox, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
                  <Ionicons name="location-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={[styles.statusNoticeText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '700', color: colors.text }}>Currently serving global home cooks. </Text>
                    We're continuously expanding our recipe collection.
                  </Text>
                </View>

                {/* 4 Main Link Cards */}
                <View style={styles.linkCardsContainer}>
                  <TouchableOpacity 
                    style={[styles.linkNavCard, { backgroundColor: colors.background, borderColor: colors.borderLight }]}
                    onPress={() => setCurrentView('mobile')}
                  >
                    <View style={styles.linkNavLeft}>
                      <Ionicons name="phone-portrait-outline" size={20} color={colors.primary} />
                      <Text style={[styles.linkNavTitle, { color: colors.text }]}>Get ChefStack Mobile App</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.linkNavCard, { backgroundColor: colors.background, borderColor: colors.borderLight }]}
                    onPress={() => setCurrentView('documentation')}
                  >
                    <View style={styles.linkNavLeft}>
                      <Ionicons name="code-slash-outline" size={20} color={colors.primary} />
                      <Text style={[styles.linkNavTitle, { color: colors.text }]}>Technical Documentation</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.linkNavCard, { backgroundColor: colors.background, borderColor: colors.borderLight }]}
                    onPress={() => setCurrentView('changelog')}
                  >
                    <View style={styles.linkNavLeft}>
                      <Ionicons name="git-branch-outline" size={20} color={colors.primary} />
                      <Text style={[styles.linkNavTitle, { color: colors.text }]}>Version 1.3.0 (Changelog)</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.linkNavCard, { backgroundColor: colors.background, borderColor: colors.borderLight }]}
                    onPress={() => navigation.navigate('Privacy')}
                  >
                    <View style={styles.linkNavLeft}>
                      <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
                      <Text style={[styles.linkNavTitle, { color: colors.text }]}>Privacy Policy</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Section 2: Quick Preferences & App Settings (Moved here as requested) */}
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Settings & Preferences</Text>
              <View style={[styles.cardSection, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                
                {/* Dark Mode Switch Toggle */}
                <View style={styles.settingRowItem}>
                  <View style={styles.settingLeftGroup}>
                    <Ionicons name={isDark ? "moon" : "sunny-outline"} size={22} color={colors.primary} />
                    <Text style={[styles.settingItemLabel, { color: colors.text }]}>Dark Mode</Text>
                  </View>
                  <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                    trackColor={{ false: '#767577', true: colors.primary }}
                    thumbColor={Platform.OS === 'ios' ? '#fff' : isDark ? colors.surface : '#f4f3f4'}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.settingRowItem, { borderTopWidth: 1, borderTopColor: colors.borderLight }]} 
                  onPress={() => user ? navigation.navigate('Notifications') : navigation.navigate('Login')}
                >
                  <View style={styles.settingLeftGroup}>
                    <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
                    <Text style={[styles.settingItemLabel, { color: colors.text }]}>Notifications</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>

              </View>

              {/* Section 3: Developer Info (Matches Tarakape /about Maker card) */}
              <Text style={[styles.sectionHeading, { color: colors.text, zIndex: 20 }]}>Developer</Text>
              <View style={[styles.cardSection, { backgroundColor: colors.surface, borderColor: colors.borderLight, position: 'relative', overflow: 'visible', paddingBottom: 20, zIndex: 10 }]}>
                
                {/* Floating Pantheon Image */}
                <View 
                  style={{ 
                    position: 'absolute', 
                    right: Platform.OS === 'web' ? -75 : -20, 
                    top: Platform.OS === 'web' ? -5 : -10, 
                    zIndex: 10, 
                    pointerEvents: 'none' 
                  }}
                >
                  <Image 
                    source={require('../../assets/pantheon.png')}
                    style={[
                      {
                        width: Platform.OS === 'web' ? 260 : 170,
                        height: Platform.OS === 'web' ? 260 : 170,
                      },
                      Platform.OS === 'web' && { filter: 'drop-shadow(-5px 8px 10px rgba(0, 0, 0, 0.25))' }
                    ]}
                    resizeMode="contain"
                  />
                </View>

                <View style={{ paddingRight: Platform.OS === 'web' ? 180 : 100, minHeight: Platform.OS === 'web' ? 140 : 120 }}>
                  <View style={[styles.developerHeaderRow, { zIndex: 1 }]}>
                    <Image 
                      source={require('../../assets/profile.png')} 
                      style={styles.developerAvatarImg} 
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.developerName, { color: colors.text }]}>Louis Neo Lok</Text>
                      <Text style={[styles.developerTitle, { color: colors.textSecondary }]}>Student Full-Stack Developer | Aspiring Software Engineer</Text>
                    </View>
                  </View>

                  <Text style={[styles.developerBio, { color: colors.textSecondary, marginBottom: 0, lineHeight: 22, zIndex: 1 }]}>
                    Hi, I'm <Text style={{ color: colors.text, fontWeight: '700' }}>Louis Neo Lok!</Text> I'm a senior IT student and developer specializing in <Text style={{ color: colors.text, fontWeight: '700' }}>LLMs, Agentic Tools,</Text> and clean web/mobile apps. Passionate about community leadership and tech education. When I'm offline, I'm either watching the latest MCU release or climbing ranks in Wild Rift!
                  </Text>
                </View>

                {/* Divider Line */}
                <View style={{ height: 1, backgroundColor: colors.borderLight, marginTop: 24, marginBottom: 20 }} />

                {/* Support Project Button */}
                <TouchableOpacity 
                  style={[styles.supportBtn, { backgroundColor: colors.background, borderColor: colors.borderLight }]}
                  onPress={() => Linking.openURL('https://www.appbuildersph.com/apps/chefstack').catch(() => {})}
                >
                  <Ionicons name="heart" size={18} color="#E53E3E" style={{ marginRight: 8 }} />
                  <Text style={[styles.supportBtnText, { color: colors.text }]}>Support the project</Text>
                </TouchableOpacity>

                {/* Social Links Grid */}
                <View style={styles.socialGrid}>
                  {[
                    { label: 'Github', icon: 'logo-github', url: 'https://github.com/louisneo' },
                    { label: 'LinkedIn', icon: 'logo-linkedin', url: 'https://ph.linkedin.com/in/louisneolok' },
                    { label: 'Facebook', icon: 'logo-facebook', url: 'https://www.facebook.com/chingchong300' },
                    { label: 'Instagram', icon: 'logo-instagram', url: 'https://www.instagram.com/_fizzlebeef/' }
                  ].map(s => (
                    <TouchableOpacity 
                      key={s.label}
                      style={[styles.socialPill, { backgroundColor: colors.background, borderColor: colors.borderLight }]}
                      onPress={() => Linking.openURL(s.url).catch(() => {})}
                    >
                      <Ionicons name={s.icon} size={18} color={colors.primary} style={{ marginBottom: 4 }} />
                      <Text style={[styles.socialPillText, { color: colors.text }]}>{s.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Section 4: Report & Feedback (Matches Tarakape /about feedback box) */}
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Report & Feedback</Text>
              <View style={[styles.cardSection, { backgroundColor: colors.surface, borderColor: colors.borderLight, padding: 0 }]}>
                <TouchableOpacity 
                  style={[styles.feedbackRow, { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
                  onPress={() => openAddRecipe()}
                >
                  <View style={styles.feedbackLeft}>
                    <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                    <Text style={[styles.feedbackLabel, { color: colors.text }]}>Suggest a Recipe</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.feedbackRow, { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
                  onPress={() => Linking.openURL('mailto:louisneolok@gmail.com?subject=Bug Report')}
                >
                  <View style={styles.feedbackLeft}>
                    <Ionicons name="bug-outline" size={20} color={colors.primary} />
                    <Text style={[styles.feedbackLabel, { color: colors.text }]}>Report a Bug</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.feedbackRow}
                  onPress={() => Linking.openURL('mailto:louisneolok@gmail.com?subject=App Feedback')}
                >
                  <View style={styles.feedbackLeft}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
                    <Text style={[styles.feedbackLabel, { color: colors.text }]}>Give Feedback</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Section 5: Frequently Asked Questions (FAQ Accordion) */}
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Frequently Asked Questions (FAQ)</Text>
              <View style={{ gap: 10 }}>
                {[
                  {
                    q: 'How does ChefStack offline mode work?',
                    a: 'ChefStack automatically caches your saved recipes locally using AsyncStorage and Service Workers. When you go offline, the app switches to offline mode instantly.'
                  },
                  {
                    q: 'Is ChefStack free to use?',
                    a: 'Yes! ChefStack is 100% free for home cooks and food enthusiasts. You can create, edit, and search AI recipes without subscription fees.'
                  },
                  {
                    q: 'Can I use ChefStack as a Guest without signing in?',
                    a: 'Yes, you can continue as a Guest! Note that guest data is session-based and cleared upon sign out.'
                  },
                  {
                    q: 'How does the AI Chef recipe search work?',
                    a: 'Our AI Chef feature is powered by Google Gemini AI models to turn natural language prompts (e.g. "quick chicken meryenda in 20 mins") into tailored recipes.'
                  }
                ].map((faq, idx) => (
                  <View key={idx} style={[styles.faqCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                    <TouchableOpacity 
                      style={styles.faqHeaderBtn} 
                      onPress={() => toggleFaqItem(idx)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.faqQuestionText, { color: colors.text }]}>{faq.q}</Text>
                      <Ionicons name={expandedFaq === idx ? "chevron-up" : "chevron-down"} size={18} color={colors.textMuted} />
                    </TouchableOpacity>

                    {expandedFaq === idx && (
                      <Text style={[styles.faqAnswerText, { color: colors.textSecondary }]}>{faq.a}</Text>
                    )}
                  </View>
                ))}
              </View>

            </Animated.View>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: MOBILE APPLICATION PAGE (https://www.tarakape.cc/mobile)            */}
          {/* ========================================================================= */}
          {currentView === 'mobile' && (
            <Animated.View entering={FadeInDown.duration(400)}>
              <View style={[styles.cardSection, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <View style={styles.heroHeaderRow}>
                  <View style={[styles.brandLogoBg, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="phone-portrait-outline" size={32} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.heroTitleText, { color: colors.text }]}>Get ChefStack on your phone</Text>
                    <Text style={[styles.heroVersionBadgeText, { color: colors.textSecondary }]}>CURRENT VERSION: V1.3.0</Text>
                  </View>
                </View>
                <Text style={[styles.brandDescriptionText, { color: colors.textSecondary }]}>
                  Discover, filter, and manage your curated culinary creations directly from your mobile device.
                </Text>

                {/* Segmented Platform Toggle (Android | iOS) */}
                <View style={[styles.segmentedContainer, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
                  <TouchableOpacity 
                    style={[styles.segmentedSegment, appPlatform === 'android' && { backgroundColor: colors.surface }]}
                    onPress={() => setAppPlatform('android')}
                  >
                    <Text style={[styles.segmentedText, { color: colors.textSecondary }, appPlatform === 'android' && { color: colors.text, fontWeight: '700' }]}>Android</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.segmentedSegment, appPlatform === 'ios' && { backgroundColor: colors.surface }]}
                    onPress={() => setAppPlatform('ios')}
                  >
                    <Text style={[styles.segmentedText, { color: colors.textSecondary }, appPlatform === 'ios' && { color: colors.text, fontWeight: '700' }]}>iOS (iPhone)</Text>
                  </TouchableOpacity>
                </View>

                {appPlatform === 'android' ? (
                  <View>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={[styles.subSectionTitle, { color: colors.text }]}>Android App (Direct APK)</Text>
                      <View style={[styles.statusBadgePill, { backgroundColor: '#D1FAE5' }]}>
                        <Text style={[styles.statusBadgeText, { color: '#065F46' }]}>READY TO INSTALL</Text>
                      </View>
                    </View>

                    <Text style={[styles.bodyNoticeText, { color: colors.textSecondary }]}>
                      Since Google Play release is in progress, you can download and install the Android APK directly on your device.
                    </Text>

                    <View style={[styles.stepsBox, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
                      <Text style={[styles.stepsBoxTitle, { color: colors.textSecondary }]}>INSTALLATION STEPS:</Text>
                      <Text style={[styles.stepItemText, { color: colors.text }]}>1. Click the <Text style={{ fontWeight: 'bold' }}>Download Android APK</Text> button below.</Text>
                      <Text style={[styles.stepItemText, { color: colors.text }]}>2. Open the downloaded file. Select <Text style={{ fontWeight: 'bold' }}>Settings</Text> if security alert shows.</Text>
                      <Text style={[styles.stepItemText, { color: colors.text }]}>3. Toggle <Text style={{ fontWeight: 'bold' }}>"Allow from this source"</Text>, then tap <Text style={{ fontWeight: 'bold' }}>Install</Text>.</Text>
                    </View>

                    <TouchableOpacity style={[styles.primaryDownloadBtn, { backgroundColor: colors.primary }]} onPress={handleDownloadAPK}>
                      <Ionicons name="download-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.primaryDownloadBtnText}>Download Android APK</Text>
                    </TouchableOpacity>

                    <View style={[styles.alternativeBox, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
                      <Text style={[styles.alternativeBoxTitle, { color: colors.textSecondary }]}>ALTERNATIVE OPTION</Text>
                      <Text style={[styles.alternativeBoxText, { color: colors.text }]}>
                        • <Text style={{ fontWeight: 'bold' }}>Android:</Text> Open in Chrome, tap three dots (top right), then tap "Add to Home Screen".
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={[styles.subSectionTitle, { color: colors.text }]}>iOS (Apple iPhone)</Text>
                      <View style={[styles.statusBadgePill, { backgroundColor: '#FEF3C7' }]}>
                        <Text style={[styles.statusBadgeText, { color: '#92400E' }]}>READY TO PUBLISH</Text>
                      </View>
                    </View>
                    <View style={[styles.alternativeBox, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
                      <Text style={[styles.alternativeBoxText, { color: colors.text }]}>
                        • <Text style={{ fontWeight: 'bold' }}>iPhone:</Text> Open in Safari, tap Share button, then tap "Add to Home Screen".
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </Animated.View>
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: TECHNICAL DOCS PAGE (https://www.tarakape.cc/documentation)       */}
          {/* ========================================================================= */}
          {currentView === 'documentation' && (
            <Animated.View entering={FadeInDown.duration(400)}>
              <View style={[styles.cardSection, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <Text style={[styles.preTitleLabel, { color: colors.primary }]}>TECHNICAL DOCS</Text>
                <Text style={[styles.docsHeaderTitle, { color: colors.text }]}>ChefStack Architecture & System Specs</Text>
                <Text style={[styles.brandDescriptionText, { color: colors.textSecondary }]}>
                  System overview, architecture layers, and technical specifications of the culinary companion app.
                </Text>

                {/* Sub-tabs OVERVIEW | FEATURES | ARCHITECTURE */}
                <View style={[styles.segmentedContainer, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
                  {['overview', 'features', 'architecture'].map(t => (
                    <TouchableOpacity 
                      key={t}
                      style={[styles.segmentedSegment, docTab === t && { backgroundColor: colors.surface }]}
                      onPress={() => setDocTab(t)}
                    >
                      <Text style={[styles.segmentedText, { color: colors.textSecondary }, docTab === t && { color: colors.text, fontWeight: '700' }]}>
                        {t.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {docTab === 'overview' && (
                  <View style={{ gap: 16 }}>
                    <Text style={[styles.subSectionTitle, { color: colors.text }]}>Platform Summary</Text>
                    <Text style={[styles.bodyNoticeText, { color: colors.textSecondary }]}>
                      ChefStack is a location-aware web and mobile system that streamlines recipe management, ingredient tracking, automated parsing, and AI-powered cooking suggestions.
                    </Text>

                    <Text style={[styles.subSectionTitle, { color: colors.text, marginTop: 12 }]}>TECHNOLOGY STACK</Text>
                    <View style={styles.techGrid}>
                      {[
                        { title: 'React Native & Expo', tag: 'MOBILE CLIENT', desc: 'Cross-platform app utilizing navigation, reanimated, and local state management.' },
                        { title: 'React & Expo Web', tag: 'WEB CLIENT', desc: 'Responsive companion web app optimized for desktop and tablet browsers.' },
                        { title: 'Supabase (PostgreSQL)', tag: 'DATABASE & AUTH', desc: 'PostgreSQL database with Row Level Security (RLS) policies and realtime sync.' },
                        { title: 'Cloudflare / Vercel CDN', tag: 'EDGE ROUTING', desc: 'Global CDN caching of heavy database assets and low-latency API routing.' },
                      ].map((item, i) => (
                        <View key={i} style={[styles.techCardItem, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
                          <Text style={[styles.techCardTag, { color: colors.primary }]}>{item.tag}</Text>
                          <Text style={[styles.techCardTitle, { color: colors.text }]}>{item.title}</Text>
                          <Text style={[styles.techCardDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {docTab === 'features' && (
                  <View style={{ gap: 16 }}>
                    {[
                      { title: '"Ask Chef" AI Recipe Recommendations', badge: 'SEMANTIC MATCHING', desc: 'Translates natural language prompts into parameterized searches.' },
                      { title: 'Menu & Photo Text Extraction', badge: 'OCR PARSING', desc: 'OCR pipeline extracting raw food, drink, and step instructions from photos.' },
                      { title: 'Offline-First Synchronization', badge: 'REALTIME SYNC', desc: 'Queries local AsyncStorage before fallback to Supabase WebSocket subscriptions.' }
                    ].map((f, i) => (
                      <View key={i} style={[styles.techCardItem, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
                        <Text style={[styles.techCardTag, { color: colors.primary }]}>{f.badge}</Text>
                        <Text style={[styles.techCardTitle, { color: colors.text }]}>{f.title}</Text>
                        <Text style={[styles.techCardDesc, { color: colors.textSecondary }]}>{f.desc}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {docTab === 'architecture' && (
                  <View style={{ gap: 16 }}>
                    {[
                      { num: '1', layer: 'Client Layer', desc: 'Executes UI layout threads, handles local state persistence (AsyncStorage), and coordinates realtime recipe updates.' },
                      { num: '2', layer: 'Edge & Routing Layer', desc: 'Handles global routing, SSL certificate termination, and CDN caching.' },
                      { num: '3', layer: 'Compute & Integration', desc: 'Handles serverless routing pipelines and runs background extraction scripts.' },
                      { num: '4', layer: 'Database & Services', desc: 'Provides persistent storage, relational schemas, user authorization pools, and cognitive text models.' }
                    ].map((l, i) => (
                      <View key={i} style={[styles.techCardItem, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
                        <Text style={[styles.techCardTag, { color: colors.primary }]}>LAYER {l.num}</Text>
                        <Text style={[styles.techCardTitle, { color: colors.text }]}>{l.layer}</Text>
                        <Text style={[styles.techCardDesc, { color: colors.textSecondary }]}>{l.desc}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </Animated.View>
          )}

          {/* ========================================================================= */}
          {/* VIEW 4: CHANGELOG PAGE (https://www.tarakape.cc/changelog)               */}
          {/* ========================================================================= */}
          {currentView === 'changelog' && (
            <Animated.View entering={FadeInDown.duration(400)}>
              <View style={[styles.cardSection, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <Text style={[styles.preTitleLabel, { color: colors.primary }]}>CHANGELOG</Text>
                <Text style={[styles.docsHeaderTitle, { color: colors.text }]}>Version History & Release Notes</Text>

                {/* Mobile / Website Toggle Switch */}
                <View style={[styles.segmentedContainer, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
                  <TouchableOpacity 
                    style={[styles.segmentedSegment, changelogTab === 'mobile' && { backgroundColor: colors.surface }]}
                    onPress={() => setChangelogTab('mobile')}
                  >
                    <Text style={[styles.segmentedText, { color: colors.textSecondary }, changelogTab === 'mobile' && { color: colors.text, fontWeight: '700' }]}>Mobile App</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.segmentedSegment, changelogTab === 'website' && { backgroundColor: colors.surface }]}
                    onPress={() => setChangelogTab('website')}
                  >
                    <Text style={[styles.segmentedText, { color: colors.textSecondary }, changelogTab === 'website' && { color: colors.text, fontWeight: '700' }]}>Website</Text>
                  </TouchableOpacity>
                </View>

                {/* Version 1.3.0 Card */}
                <View style={[styles.versionBoxCard, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
                  <View style={styles.versionHeaderRow}>
                    <Text style={[styles.versionTitleText, { color: colors.text }]}>Version 1.3.0</Text>
                    <Text style={[styles.versionDateText, { color: colors.textSecondary }]}>SEPTEMBER 2026</Text>
                  </View>
                  
                  <Text style={[styles.changeCategoryTag, { color: '#10B981' }]}>ADDED</Text>
                  <Text style={[styles.changeBulletText, { color: colors.text }]}>• Floating bottom navigation pill bar for responsive PC and mobile navigation.</Text>
                  <Text style={[styles.changeBulletText, { color: colors.text }]}>• Comprehensive About landing page with integrated settings, FAQ, and developer info.</Text>
                  <Text style={[styles.changeBulletText, { color: colors.text }]}>• Direct APK download asset and PWA installation steps.</Text>
                  <Text style={[styles.changeBulletText, { color: colors.text }]}>• Interactive recipe filter panel with max cooking time range slider.</Text>

                  <Text style={[styles.changeCategoryTag, { color: '#3B82F6', marginTop: 10 }]}>IMPROVED</Text>
                  <Text style={[styles.changeBulletText, { color: colors.text }]}>• Isolated Guest Mode: guest sessions start clean with zero default recipes.</Text>
                  <Text style={[styles.changeBulletText, { color: colors.text }]}>• Resolved recipe deletion errors in offline/guest modes.</Text>
                </View>

                {/* Version 1.0.0 Card (AppBuilders PH Release) */}
                <View style={[styles.versionBoxCard, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
                  <View style={styles.versionHeaderRow}>
                    <Text style={[styles.versionTitleText, { color: colors.text }]}>Version 1.0.0</Text>
                    <Text style={[styles.versionDateText, { color: colors.textSecondary }]}>JUNE 8, 2026</Text>
                  </View>
                  <Text style={[styles.changeCategoryTag, { color: '#10B981' }]}>ADDED</Text>
                  <Text style={[styles.changeBulletText, { color: colors.text }]}>• Initial public release on AppBuilders PH (https://www.appbuildersph.com/apps/chefstack).</Text>
                  <Text style={[styles.changeBulletText, { color: colors.text }]}>• Smart AI recipe generation powered by Google Gemini Flash.</Text>
                  <Text style={[styles.changeBulletText, { color: colors.text }]}>• Full offline caching with Service Workers and AsyncStorage.</Text>
                </View>

              </View>
            </Animated.View>
          )}

          {/* ========================================================================= */}
          {/* VIEW 5: PRIVACY POLICY PAGE (https://www.tarakape.cc/privacy)             */}
          {/* ========================================================================= */}
          {currentView === 'privacy' && (
            <Animated.View entering={FadeInDown.duration(400)}>
              <View style={[styles.cardSection, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <Text style={[styles.preTitleLabel, { color: colors.primary }]}>PRIVACY POLICY</Text>
                <Text style={[styles.docsHeaderTitle, { color: colors.text }]}>Data Privacy & Local Storage Guarantee</Text>
                <Text style={[styles.brandDescriptionText, { color: colors.textSecondary }]}>
                  At ChefStack, we respect your privacy. All your guest data and offline recipes remain stored safely on your local device. We do not sell or track your personal information.
                </Text>
              </View>
            </Animated.View>
          )}

          <View style={[styles.footerContainer, { borderTopColor: colors.borderLight }]}>
            <Text style={[styles.footerSupportText, { color: colors.textSecondary }]}>
              For support or feedback, reach out at <Text style={{ fontWeight: '700', color: colors.primary }}>louisneolok@gmail.com</Text>
            </Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBackText: {
    fontSize: 18,
    fontWeight: '800',
  },
  backToAboutPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  backToAboutText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    paddingBottom: 180,
    alignItems: 'center',
  },
  maxWidthContainer: {
    width: '100%',
    maxWidth: 720,
  },

  /* Card Sections */
  cardSection: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    marginBottom: 20,
  },
  brandHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  brandLogoBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitleText: {
    fontSize: 22,
    fontWeight: '800',
  },
  brandTaglineText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  brandDescriptionText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  statusNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  statusNoticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },

  /* Link Navigation Cards */
  linkCardsContainer: {
    gap: 10,
  },
  linkNavCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  linkNavLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkNavTitle: {
    fontSize: 14,
    fontWeight: '700',
  },

  /* Section Headings */
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 8,
  },

  /* Settings Rows */
  settingRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingItemLabel: {
    fontSize: 15,
    fontWeight: '600',
  },

  /* Developer Info */
  developerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  developerAvatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  developerName: {
    fontSize: 17,
    fontWeight: '800',
  },
  developerTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  developerBio: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  supportBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  socialGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  socialPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  socialPillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* Report & Feedback */
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  feedbackLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '700',
  },

  /* FAQ Accordion */
  faqCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  faqHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    paddingRight: 10,
  },
  faqAnswerText: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },

  /* Sub-view Styling */
  preTitleLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  docsHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  heroTitleText: {
    fontSize: 20,
    fontWeight: '800',
  },
  heroVersionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    marginVertical: 16,
  },
  segmentedSegment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  statusBadgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  bodyNoticeText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  stepsBox: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  stepsBoxTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  stepItemText: {
    fontSize: 13,
    lineHeight: 18,
  },
  primaryDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  primaryDownloadBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  alternativeBox: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  alternativeBoxTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  alternativeBoxText: {
    fontSize: 13,
    lineHeight: 18,
  },
  techGrid: {
    gap: 10,
  },
  techCardItem: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  techCardTag: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  techCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  techCardDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  versionBoxCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  versionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  versionTitleText: {
    fontSize: 16,
    fontWeight: '800',
  },
  versionDateText: {
    fontSize: 11,
    fontWeight: '700',
  },
  changeCategoryTag: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  changeBulletText: {
    fontSize: 13,
    lineHeight: 19,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  footerSupportText: {
    fontSize: 12,
    textAlign: 'center',
  }
});
