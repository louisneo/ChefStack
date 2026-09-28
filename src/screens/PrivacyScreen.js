import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  useWindowDimensions,
  TextInput
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const POLICY_SECTIONS = [
  { id: 'intro', icon: 'information-circle-outline', title: 'Introduction', content: 'Welcome to ChefStack ("the Platform", "we", "our", or "us"). We are committed to protecting your privacy and handling your information responsibly. This Privacy Policy explains what information we collect, how we use it, and the choices available to you when using our website and mobile application.\n\nBy accessing or using ChefStack, you agree to the practices described in this Privacy Policy.' },
  { id: 'collect', icon: 'book-outline', title: 'Information We Collect', isList: true },
  { id: 'use', icon: 'shield-outline', title: 'How We Use Information', content: 'We use collected information to:\n• Provide and maintain the Platform and its features\n• Personalize recommendations and AI searches\n• Improve user experience and platform performance\n• Monitor security, reliability, and system health\n• Respond to inquiries and provide support' },
  { id: 'share', icon: 'share-social-outline', title: 'Information Sharing and Disclosure', content: 'We do NOT sell your personal information.\n\nWe may share information in the following situations:\n• With service providers that help operate the Platform (hosting, analytics, auth, and AI processing)\n• When required by law, legal process, or official government requests\n• To protect the rights, property, safety, and security of our users and the Platform' },
  { id: 'third', icon: 'document-text-outline', title: 'Third-Party Services', content: 'ChefStack uses third-party services and technologies to deliver features and improve experience (such as Supabase for authentication and Google Gemini for AI). These services process data according to their own privacy policies. We encourage users to review the privacy practices of these third-party providers.' },
  { id: 'ugc', icon: 'person-add-outline', title: 'User-Generated Content', content: 'The Platform allows you to submit user-generated content, including recipes, notes, and photos.\n\nImportant Warning: Any content you submit may be visible to other users if shared publicly. Please avoid sharing sensitive or confidential information in public fields.' },
  { id: 'retention', icon: 'sync-outline', title: 'Data Retention', content: 'We retain information only for as long as necessary to provide the services, resolve disputes, enforce agreements, and maintain security. Once no longer needed, data is deleted, anonymized, or aggregated.' },
  { id: 'security', icon: 'lock-closed-outline', title: 'Data Security', content: 'We implement administrative, technical, and organizational safeguards designed to protect your information from unauthorized access, loss, or alteration.\n\n* While we strive to protect your data, no method of transmission over the internet can be guaranteed 100% secure.' },
  { id: 'children', icon: 'scale-outline', title: "Children's Privacy", content: 'ChefStack is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If discovered, we will take steps to remove such records immediately.' },
  { id: 'contact', icon: 'mail-outline', title: 'Contact Us', content: 'If you have questions, concerns, or requests regarding this Privacy Policy, please contact the developer:\n\nLouis Neo Lok\nFull Stack AI Engineer, ChefStack' }
];

export default function PrivacyScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  
  const [activeSection, setActiveSection] = useState('intro');
  const [searchQuery, setSearchQuery] = useState('');

  const scrollViewRef = useRef(null);
  const sectionLayouts = useRef({});

  const handleScrollToSection = (id) => {
    setActiveSection(id);
    const yOffset = sectionLayouts.current[id];
    if (yOffset !== undefined && scrollViewRef.current) {
      // Add roughly 100px to account for the top header height
      scrollViewRef.current.scrollTo({ y: yOffset + 100, animated: true });
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'Profile' });
    }
  };

  const renderInfoList = () => (
    <View style={styles.listContainer}>
      <Text style={[styles.listHeader, { color: colors.textSecondary }]}>INFORMATION YOU PROVIDE</Text>
      <View style={styles.listItem}><View style={[styles.bullet, { backgroundColor: colors.primary }]} /><Text style={[styles.listText, { color: colors.textSecondary }]}>Name and profile information</Text></View>
      <View style={styles.listItem}><View style={[styles.bullet, { backgroundColor: colors.primary }]} /><Text style={[styles.listText, { color: colors.textSecondary }]}>Email address</Text></View>
      <View style={styles.listItem}><View style={[styles.bullet, { backgroundColor: colors.primary }]} /><Text style={[styles.listText, { color: colors.textSecondary }]}>Reviews, ratings, comments, and feedback</Text></View>
      <View style={styles.listItem}><View style={[styles.bullet, { backgroundColor: colors.primary }]} /><Text style={[styles.listText, { color: colors.textSecondary }]}>Information submitted through forms, inquiries, or support requests</Text></View>
      
      <Text style={[styles.listHeader, { color: colors.textSecondary, marginTop: 20 }]}>AUTOMATICALLY COLLECTED INFORMATION</Text>
      <View style={styles.listItem}><View style={[styles.bullet, { backgroundColor: colors.primary }]} /><Text style={[styles.listText, { color: colors.textSecondary }]}>Device information (device type, OS, browser type)</Text></View>
      <View style={styles.listItem}><View style={[styles.bullet, { backgroundColor: colors.primary }]} /><Text style={[styles.listText, { color: colors.textSecondary }]}>IP address</Text></View>
      <View style={styles.listItem}><View style={[styles.bullet, { backgroundColor: colors.primary }]} /><Text style={[styles.listText, { color: colors.textSecondary }]}>General usage information and activity within the Platform</Text></View>
      <View style={styles.listItem}><View style={[styles.bullet, { backgroundColor: colors.primary }]} /><Text style={[styles.listText, { color: colors.textSecondary }]}>Diagnostic and performance information</Text></View>
      <View style={styles.listItem}><View style={[styles.bullet, { backgroundColor: colors.primary }]} /><Text style={[styles.listText, { color: colors.textSecondary }]}>Analytics and crash reports</Text></View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContainer} stickyHeaderIndices={[]}>
        <View style={styles.innerWrapper}>
          
          {/* Top Header matching screenshot */}
          <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.headerTitleGroup}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
                <View style={styles.dateGroup}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.dateText, { color: colors.textMuted }]}>Effective Date: September 28, 2026</Text>
                </View>
              </View>
            </View>

            {isDesktop && (
              <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput 
                  placeholder="Search privacy topics..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.searchInput, { color: colors.text }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            )}
          </View>

          {/* Main 2-Column Layout */}
          <View style={[styles.mainLayout, { flexDirection: isDesktop ? 'row' : 'column' }]}>
            
            {/* Sidebar (Table of Contents) */}
            {isDesktop && (
              <View style={styles.sidebarCol}>
                <View style={[styles.sidebarCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                  <Text style={[styles.tocTitle, { color: colors.textMuted }]}>TABLE OF CONTENTS</Text>
                  <View style={styles.tocList}>
                    {POLICY_SECTIONS.map((sec) => {
                      const isActive = activeSection === sec.id;
                      return (
                        <TouchableOpacity 
                          key={sec.id}
                          onPress={() => handleScrollToSection(sec.id)}
                          style={[
                            styles.tocItem, 
                            isActive && { backgroundColor: isDark ? colors.borderLight : '#F3E8DA', borderColor: isDark ? colors.border : '#E8DAC8' }
                          ]}
                        >
                          <Ionicons 
                            name={sec.icon} 
                            size={16} 
                            color={isActive ? colors.primary : colors.textMuted} 
                            style={{ marginRight: 10 }}
                          />
                          <Text style={[
                            styles.tocItemText, 
                            { color: isActive ? colors.primary : colors.textSecondary },
                            isActive && { fontWeight: '700' }
                          ]}>
                            {sec.title}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* Main Content Area */}
            <View style={styles.contentCol}>
              <Animated.View entering={FadeInDown.duration(400)}>
                {POLICY_SECTIONS.map((sec) => (
                  <View 
                    key={sec.id} 
                    style={[styles.contentCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                    onLayout={(event) => {
                      sectionLayouts.current[sec.id] = event.nativeEvent.layout.y;
                    }}
                  >
                    <View style={[styles.cardHeader, { borderBottomColor: colors.borderLight }]}>
                      <View style={[styles.cardIconBox, { backgroundColor: isDark ? colors.background : '#F3E8DA', borderColor: colors.borderLight }]}>
                        <Ionicons name={sec.icon} size={16} color={colors.text} />
                      </View>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>{sec.title}</Text>
                    </View>
                    <View style={styles.cardBody}>
                      {sec.isList ? renderInfoList() : (
                        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>{sec.content}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </Animated.View>
            </View>

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
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  innerWrapper: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 24,
    borderBottomWidth: 1,
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleGroup: {
    flexDirection: 'column',
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 280,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    height: '100%',
    outlineStyle: 'none',
  },
  mainLayout: {
    gap: 24,
    alignItems: 'flex-start',
  },
  sidebarCol: {
    width: 260,
    flexShrink: 0,
  },
  sidebarCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  tocTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 16,
  },
  tocList: {
    gap: 4,
  },
  tocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tocItemText: {
    fontSize: 13,
    fontWeight: '600',
  },
  contentCol: {
    flex: 1,
    width: '100%',
  },
  contentCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  cardIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardBody: {
    padding: 20,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '500',
  },
  listContainer: {
    width: '100%',
  },
  listHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 10,
  },
  listText: {
    fontSize: 14,
    fontWeight: '500',
  }
});
