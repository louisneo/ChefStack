import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Platform,
  Image,
  Linking
} from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function AboutScreen() {
  const navigation = useNavigation();

  // Navigation tabs: 'app' | 'docs'
  const [mainTab, setMainTab] = useState('app');
  
  // Docs sub-tabs: 'overview' | 'features' | 'architecture'
  const [docTab, setDocTab] = useState('overview');

  // Mobile App sub-tabs: 'android' | 'ios'
  const [appPlatform, setAppPlatform] = useState('android');

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'Profile' });
    }
  };

  const handleDownloadAPK = () => {
    Linking.openURL('https://chefstack.vercel.app/download/chefstack.apk').catch(() => {
      alert('APK download will be available upon official release.');
    });
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerBackBtn} accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
          <Text style={styles.headerBackText}>
            {mainTab === 'app' ? 'Mobile Application' : 'Technical Docs'}
          </Text>
        </TouchableOpacity>

        {/* Main Tab Switcher in Header */}
        <View style={styles.mainTabPillContainer}>
          <TouchableOpacity 
            style={[styles.mainTabPill, mainTab === 'app' && styles.mainTabPillActive]}
            onPress={() => setMainTab('app')}
          >
            <Text style={[styles.mainTabPillText, mainTab === 'app' && styles.mainTabPillTextActive]}>Mobile App</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.mainTabPill, mainTab === 'docs' && styles.mainTabPillActive]}
            onPress={() => setMainTab('docs')}
          >
            <Text style={[styles.mainTabPillText, mainTab === 'docs' && styles.mainTabPillTextActive]}>Technical Docs</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.maxWidthContainer}>

          {/* ========================================================================= */}
          {/* TAB 1: MOBILE APPLICATION DOWNLOAD PAGE (Screenshots 1 & 2)              */}
          {/* ========================================================================= */}
          {mainTab === 'app' && (
            <Animated.View entering={FadeInDown.duration(400)}>
              {/* Header Hero Card */}
              <View style={styles.cardHeaderHero}>
                <View style={styles.iconCircleBg}>
                  <Ionicons name="phone-portrait-outline" size={32} color={colors.primary} />
                </View>
                <View style={styles.heroTextWrapper}>
                  <Text style={styles.heroTitle}>Get ChefStack on your phone</Text>
                  <Text style={styles.heroVersionBadge}>CURRENT VERSION: V1.3.0</Text>
                  <Text style={styles.heroDescription}>
                    Discover, filter, and manage your curated culinary creations directly from your mobile device.
                  </Text>
                </View>
              </View>

              {/* Segmented Platform Toggle (Android | iOS) */}
              <View style={styles.segmentedContainer}>
                <TouchableOpacity 
                  style={[styles.segmentedSegment, appPlatform === 'android' && styles.segmentedSegmentActive]}
                  onPress={() => setAppPlatform('android')}
                >
                  <Text style={[styles.segmentedText, appPlatform === 'android' && styles.segmentedTextActive]}>Android</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.segmentedSegment, appPlatform === 'ios' && styles.segmentedSegmentActive]}
                  onPress={() => setAppPlatform('ios')}
                >
                  <Text style={[styles.segmentedText, appPlatform === 'ios' && styles.segmentedTextActive]}>iOS (iPhone)</Text>
                </TouchableOpacity>
              </View>

              {/* ANDROID PLATFORM CONTENT */}
              {appPlatform === 'android' && (
                <View style={styles.contentSectionCard}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitleText}>Android App (Direct APK)</Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5' }]}>
                      <Text style={[styles.statusBadgeText, { color: '#065F46' }]}>READY TO INSTALL</Text>
                    </View>
                  </View>

                  <Text style={styles.bodyText}>
                    Since the Google Play Store release is in progress, you can download and install the Android APK directly on your device.
                  </Text>

                  {/* Installation Steps Box */}
                  <View style={styles.stepsCard}>
                    <Text style={styles.stepsTitle}>INSTALLATION STEPS:</Text>
                    
                    <View style={styles.stepItemRow}>
                      <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>1</Text></View>
                      <Text style={styles.stepDetailText}>
                        Click the <Text style={{ fontWeight: 'bold' }}>Download Android APK</Text> button below to download the package file.
                      </Text>
                    </View>

                    <View style={styles.stepItemRow}>
                      <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>2</Text></View>
                      <Text style={styles.stepDetailText}>
                        Open the downloaded file. If prompted with a security alert, select <Text style={{ fontWeight: 'bold' }}>Settings</Text>.
                      </Text>
                    </View>

                    <View style={styles.stepItemRow}>
                      <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>3</Text></View>
                      <Text style={styles.stepDetailText}>
                        Toggle <Text style={{ fontWeight: 'bold' }}>"Allow from this source"</Text> (Unknown Sources) to grant installation permission, then return and tap <Text style={{ fontWeight: 'bold' }}>Install</Text>.
                      </Text>
                    </View>
                  </View>

                  {/* Download APK Button */}
                  <TouchableOpacity style={styles.primaryActionButton} onPress={handleDownloadAPK} activeOpacity={0.85}>
                    <Ionicons name="download-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.primaryActionButtonText}>Download Android APK</Text>
                  </TouchableOpacity>

                  {/* Alternative Option Card */}
                  <View style={styles.alternativeCard}>
                    <Text style={styles.alternativeTitle}>ALTERNATIVE OPTION</Text>
                    <Text style={styles.alternativeSubtitle}>If you don't want to download the APK file, then:</Text>
                    <Text style={styles.alternativeBodyText}>Add it to your home screen if you want to use it like an app:</Text>
                    <Text style={styles.alternativeBullet}>• <Text style={{ fontWeight: 'bold' }}>Android:</Text> Open in Chrome, tap the three-dot menu (top right), then tap "Add to Home Screen".</Text>
                  </View>
                </View>
              )}

              {/* IOS PLATFORM CONTENT */}
              {appPlatform === 'ios' && (
                <View style={styles.contentSectionCard}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitleText}>iOS (Apple iPhone)</Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
                      <Text style={[styles.statusBadgeText, { color: '#92400E' }]}>READY TO PUBLISH</Text>
                    </View>
                  </View>

                  <Text style={styles.bodyText}>
                    Since the Apple App Store package is currently in review, you can add ChefStack to your home screen to use it as a Progressive Web App (PWA).
                  </Text>

                  <View style={styles.alternativeCard}>
                    <Text style={styles.alternativeTitle}>Add it to your home screen if you want to use it like an app:</Text>
                    <Text style={styles.alternativeBullet}>• <Text style={{ fontWeight: 'bold' }}>iPhone:</Text> Open in Safari, tap the Share button, then tap "Add to Home Screen".</Text>
                  </View>

                  <View style={styles.warningAlertCard}>
                    <Ionicons name="information-circle-outline" size={22} color={colors.textSecondary} style={{ marginRight: 10 }} />
                    <Text style={styles.warningAlertText}>
                      Due to Apple's security requirements, native iOS apps can only be distributed through the official App Store. Stay tuned for the official release.
                    </Text>
                  </View>
                </View>
              )}
            </Animated.View>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: TECHNICAL DOCS PAGE (Screenshots 3, 4 & 5)                          */}
          {/* ========================================================================= */}
          {mainTab === 'docs' && (
            <Animated.View entering={FadeInDown.duration(400)}>
              {/* Docs Top Hero Banner */}
              <View style={styles.docsHeroBanner}>
                <Text style={styles.docsPreTitle}>TECHNICAL DOCS</Text>
                <Text style={styles.docsTitle}>ChefStack Recipe Manager</Text>
                <Text style={styles.docsSubtitle}>
                  System overview, architecture layers, and technical specifications of the culinary companion app.
                </Text>
              </View>

              {/* Sub-tab Navigation (OVERVIEW | FEATURES | ARCHITECTURE) */}
              <View style={styles.segmentedContainer}>
                <TouchableOpacity 
                  style={[styles.segmentedSegment, docTab === 'overview' && styles.segmentedSegmentActive]}
                  onPress={() => setDocTab('overview')}
                >
                  <Text style={[styles.segmentedText, docTab === 'overview' && styles.segmentedTextActive]}>OVERVIEW</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.segmentedSegment, docTab === 'features' && styles.segmentedSegmentActive]}
                  onPress={() => setDocTab('features')}
                >
                  <Text style={[styles.segmentedText, docTab === 'features' && styles.segmentedTextActive]}>FEATURES</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.segmentedSegment, docTab === 'architecture' && styles.segmentedSegmentActive]}
                  onPress={() => setDocTab('architecture')}
                >
                  <Text style={[styles.segmentedText, docTab === 'architecture' && styles.segmentedTextActive]}>ARCHITECTURE</Text>
                </TouchableOpacity>
              </View>

              {/* SUB-TAB 1: OVERVIEW */}
              {docTab === 'overview' && (
                <View style={{ gap: 20 }}>
                  <View style={styles.contentSectionCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <Ionicons name="cube-outline" size={24} color={colors.primary} />
                      <Text style={styles.sectionTitleText}>Platform Summary</Text>
                    </View>
                    <Text style={styles.bodyText}>
                      ChefStack is a location-aware web and mobile system that streamlines recipe management, ingredient tracking, automated parsing, and AI-powered cooking suggestions to match users with their favorite culinary creations.
                    </Text>
                  </View>

                  <Text style={styles.groupHeadingText}>TECHNOLOGY STACK</Text>
                  <View style={styles.techStackGrid}>
                    {[
                      { icon: 'phone-portrait', label: 'MOBILE CLIENT', title: 'React Native & Expo', desc: 'Cross-platform mobile app utilizing file-based navigation, reanimated, and local state management.' },
                      { icon: 'globe', label: 'WEB CLIENT', title: 'React & Expo Web', desc: 'Responsive companion web app optimized for desktop browsers and tablet experience.' },
                      { icon: 'server', label: 'DATABASE & AUTH', title: 'Supabase (PostgreSQL)', desc: 'PostgreSQL database with Row Level Security (RLS) policies and real-time database subscriptions.' },
                      { icon: 'cloudy', label: 'EDGE ROUTING', title: 'Cloudflare / Vercel CDN', desc: 'Global CDN caching of heavy database assets and low-latency API response routing.' },
                      { icon: 'code-working', label: 'SERVERLESS COMPUTE', title: 'Node.js API Routes', desc: 'Serverless API endpoints used to handle secure proxy queries and background tasks.' },
                      { icon: 'sparkles', label: 'AI GENERATOR', title: 'Google Gemini AI', desc: 'Conversational search engine using LLM models to generate recipes and match ingredients.' },
                      { icon: 'scan', label: 'OCR PARSER', title: 'OCR Text Recognition', desc: 'Computer vision pipeline used to extract structured ingredient lists and instructions from photos.' },
                      { icon: 'folder', label: 'OBJECT STORAGE', title: 'Cloud Storage Buckets', desc: 'Secure cloud buckets used for user recipe uploads and food photography.' },
                    ].map((item, idx) => (
                      <View key={idx} style={styles.techStackCard}>
                        <View style={styles.techHeaderRow}>
                          <Ionicons name={item.icon} size={22} color={colors.primary} />
                          <Text style={styles.techLabelTag}>{item.label}</Text>
                        </View>
                        <Text style={styles.techTitleText}>{item.title}</Text>
                        <Text style={styles.techDescText}>{item.desc}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* SUB-TAB 2: FEATURES */}
              {docTab === 'features' && (
                <View style={{ gap: 20 }}>
                  <Text style={styles.groupHeadingText}>KEY FEATURES (SORTED BY COMPLEXITY)</Text>

                  {[
                    {
                      badge: 'SEMANTIC CONTEXT MATCHING',
                      title: '"Ask Chef" AI Recipe Recommendations',
                      subtitle: 'Processes natural language inputs and queries recipe databases using custom prompt injection protection.',
                      bullets: [
                        'Translates unstructured user prompts into parameterized searches.',
                        'Implements rate-limiting guards inside serverless middleware.',
                        'Performs context-aware similarity filtering to match cooking preferences.'
                      ]
                    },
                    {
                      badge: 'OCR INGREDIENT PARSING',
                      title: 'Menu & Photo Text Extraction',
                      subtitle: 'OCR pipeline extracting raw food, drink, and step instructions from photos, indexable via full-text search.',
                      bullets: [
                        'Indexes structured recipe content into queryable relational columns.',
                        'Supports semantic substring matching and tokenized text lookups.',
                        'Returns corresponding culinary entities sorted by relevance.'
                      ]
                    },
                    {
                      badge: 'SMART CATEGORY ENGINE',
                      title: 'Real-Time Filtering & Instant Autocomplete',
                      subtitle: 'Instant filtering system for Ulam, Meryenda, Drinks, and custom tags with zero latency.',
                      bullets: [
                        'Provides dynamic autocomplete dropdown suggestions based on saved recipes.',
                        'Sorts by newest, oldest, and alphabetical ordering instantly.',
                        'Persists user favorites seamlessly across offline and online modes.'
                      ]
                    },
                    {
                      badge: 'OFFLINE-FIRST SYNCHRONIZATION',
                      title: 'Local Caching & Realtime Sync',
                      subtitle: 'Queries local AsyncStorage before fallback to Supabase WebSocket subscriptions.',
                      bullets: [
                        'Generates local UUIDs for offline creation.',
                        'Subscribes to realtime Postgres changes for live updates.',
                        'Minimizes network compute footprint by avoiding redundant fetch loops.'
                      ]
                    }
                  ].map((feat, idx) => (
                    <View key={idx} style={styles.featureDetailCard}>
                      <View style={styles.featureBadgePill}>
                        <Ionicons name="sparkles" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                        <Text style={styles.featureBadgeText}>{feat.badge}</Text>
                      </View>
                      <Text style={styles.featureCardTitle}>{feat.title}</Text>
                      <Text style={styles.featureCardSubtitle}>{feat.subtitle}</Text>
                      <View style={{ gap: 6, marginTop: 10 }}>
                        {feat.bullets.map((b, bIdx) => (
                          <Text key={bIdx} style={styles.featureBulletItem}>• {b}</Text>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* SUB-TAB 3: ARCHITECTURE */}
              {docTab === 'architecture' && (
                <View style={{ gap: 20 }}>
                  <Text style={styles.groupHeadingText}>DATA FLOW & LAYERS</Text>

                  {[
                    {
                      num: '1',
                      layer: 'Client Layer',
                      desc: 'Executes UI layout threads, handles local state persistence (AsyncStorage), and coordinates realtime recipe updates.',
                      tags: ['React Native (Expo)', 'Expo Web', 'Context API', 'AsyncStorage']
                    },
                    {
                      num: '2',
                      layer: 'Edge & Routing Layer',
                      desc: 'Handles global routing, SSL certificate termination, CDN caching of read-heavy database payloads, and middleware rate-limiting checks.',
                      tags: ['Cloudflare Edge CDN', 'Edge Middleware', 'Cached Response Instance']
                    },
                    {
                      num: '3',
                      layer: 'Compute & Integration',
                      desc: 'Handles serverless routing pipelines, executes API proxies, and runs background extraction scripts for recipe generation.',
                      tags: ['Serverless API', 'AI Proxy Node', 'OCR Parser Engine']
                    },
                    {
                      num: '4',
                      layer: 'Database & Services',
                      desc: 'Provides persistent storage, relational schemas, user authorization pools, and cognitive text models.',
                      tags: ['Supabase PostgreSQL', 'Storage Buckets', 'Gemini AI Engine']
                    },
                    {
                      num: '5',
                      layer: 'Integration Specifications',
                      desc: 'API requests route transparently through the Edge CDN before execution. Real-time sync uses dynamic WebSocket channels to keep response times under 100ms.',
                      tags: ['WebSocket Realtime', 'Row Level Security', '100ms Target Latency']
                    }
                  ].map((layer, idx) => (
                    <View key={idx} style={styles.architectureLayerCard}>
                      <View style={styles.layerHeaderRow}>
                        <View style={styles.layerNumCircle}>
                          <Text style={styles.layerNumText}>{layer.num}</Text>
                        </View>
                        <Text style={styles.layerTitleText}>{layer.layer}</Text>
                      </View>
                      <Text style={styles.layerDescText}>{layer.desc}</Text>
                      <View style={styles.tagRowContainer}>
                        {layer.tags.map((t, tIdx) => (
                          <View key={tIdx} style={styles.tagBadge}>
                            <Text style={styles.tagBadgeText}>{t}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </Animated.View>
          )}

          {/* Footer Information */}
          <View style={styles.footerSection}>
            <Text style={styles.supportText}>For support or inquiries, email us at support@chefstack.app</Text>

            <View style={styles.legalLinksRow}>
              <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
                <Text style={styles.legalLinkText}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.legalDot}>•</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
                <Text style={styles.legalLinkText}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={styles.legalDot}>•</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CookiePolicy')}>
                <Text style={styles.legalLinkText}>Cookie Policy</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.copyrightText}>© 2026 ChefStack. All rights reserved.</Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBackText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  mainTabPillContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  mainTabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  mainTabPillActive: {
    backgroundColor: colors.primary,
  },
  mainTabPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  mainTabPillTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    paddingBottom: 120,
    alignItems: 'center',
  },
  maxWidthContainer: {
    width: '100%',
    maxWidth: 840,
  },

  /* Hero Cards */
  cardHeaderHero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
    gap: 16,
  },
  iconCircleBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrapper: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  heroVersionBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  /* Segmented Toggles */
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
  },
  segmentedSegment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  segmentedSegmentActive: {
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentedText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentedTextActive: {
    color: colors.text,
    fontWeight: '700',
  },

  /* Sections */
  contentSectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },

  /* Steps Box */
  stepsCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
    gap: 12,
  },
  stepsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  stepItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  stepDetailText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },

  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  alternativeCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
  },
  alternativeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  alternativeSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  alternativeBodyText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  alternativeBullet: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },

  warningAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  warningAlertText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  /* Technical Docs Components */
  docsHeroBanner: {
    marginBottom: 20,
  },
  docsPreTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  docsTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  docsSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  groupHeadingText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  techStackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  techStackCard: {
    width: Platform.OS === 'web' ? '48.5%' : '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  techHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  techLabelTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  techTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  techDescText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },

  featureDetailCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  featureBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  featureBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  featureCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  featureCardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  featureBulletItem: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },

  architectureLayerCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  layerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  layerNumCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  layerNumText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  layerTitleText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  layerDescText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  tagRowContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  /* Footer */
  footerSection: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 12,
  },
  supportText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legalLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  legalDot: {
    color: colors.textMuted,
  },
  copyrightText: {
    fontSize: 12,
    color: colors.textMuted,
  }
});
