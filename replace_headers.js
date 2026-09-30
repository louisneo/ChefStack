const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');

const screens = [
  { file: 'TermsScreen.js', title: 'Terms of Service', subtitle: 'Last Updated: September 7, 2026', icon: 'document-text-outline' },
  { file: 'HelpScreen.js', title: 'Help & Support', subtitle: 'App Version 1.2.0', icon: 'help-buoy-outline' },
  { file: 'CookiePolicyScreen.js', title: 'Cookie Policy', subtitle: 'Last Updated: September 1, 2026', icon: 'cookie-outline' },
  { file: 'NotificationsScreen.js', title: 'Notifications', subtitle: 'Manage your alerts', icon: 'notifications-outline' },
  { file: 'AboutScreen.js', title: 'About ChefStack', subtitle: 'Version 1.2.0', icon: 'information-circle-outline' },
  { file: 'ProfileScreen.js', title: 'Profile', subtitle: 'Manage your account', icon: 'person-outline' },
];

screens.forEach(({ file, title, subtitle, icon }) => {
  const filePath = path.join(screensDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  // Normalize line endings to avoid regex issues
  content = content.replace(/\r\n/g, '\n');

  // Inject PageHeader import
  if (!content.includes('import PageHeader')) {
    content = content.replace(
      "import { Ionicons } from '@expo/vector-icons';",
      "import { Ionicons } from '@expo/vector-icons';\nimport PageHeader from '../components/PageHeader';"
    );
  }

  // Inject useTheme for screens that used static colors (keep static colors import so StyleSheet doesn't crash)
  if (content.includes("import { colors } from '../theme/colors';")) {
    if (!content.includes("import { useTheme }")) {
      content = content.replace(
        "import { colors } from '../theme/colors';",
        "import { colors } from '../theme/colors';\nimport { useTheme } from '../context/ThemeContext';"
      );
    }
    // Add useTheme inside component
    const compRegex = /export default function ([A-Za-z0-9]+)\(\s*([^)]*)\s*\)\s*\{/;
    if (!content.includes('const { colors, isDark } = useTheme();') && !content.includes('const { colors } = useTheme();')) {
      content = content.replace(compRegex, (match) => {
        return `${match}\n  const { colors, isDark } = useTheme();`;
      });
    }
  }

  // Terms, Help, Cookie, Notifications
  if (['TermsScreen.js', 'HelpScreen.js', 'CookiePolicyScreen.js', 'NotificationsScreen.js'].includes(file)) {
    content = content.replace(/<View style=\{styles\.header\}>[\s\S]*?<View style=\{\{\s*width:\s*44\s*\}\}\s*\/>\n\s*<\/View>/, 
      `<PageHeader title="${title}" subtitle="${subtitle}" icon="${icon}" onBack={handleBack} />`
    );
    // Override container background to use dynamic theme color
    content = content.replace(/<View style=\{styles\.container\}>/, '<View style={[styles.container, { backgroundColor: colors.background }]}>');
    // For Content / Sections in Terms, add dynamic background color override to fix dark mode
    if (file === 'TermsScreen.js' || file === 'HelpScreen.js' || file === 'CookiePolicyScreen.js') {
       content = content.replace(/<ScrollView contentContainerStyle=\{styles\.content\}>/g, '<ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}>');
       content = content.replace(/style=\{styles\.section\}/g, 'style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}');
       content = content.replace(/style=\{\[styles\.section,\s*styles\.warningBox\]\}/g, 'style={[styles.section, styles.warningBox, { backgroundColor: colors.surface }]}');
       // text colors override
       content = content.replace(/style=\{styles\.sectionTitle\}/g, 'style={[styles.sectionTitle, { color: colors.text }]}');
       content = content.replace(/style=\{styles\.paragraph\}/g, 'style={[styles.paragraph, { color: colors.textSecondary }]}');
       content = content.replace(/style=\{styles\.bulletPoint\}/g, 'style={[styles.bulletPoint, { color: colors.textSecondary }]}');
    }
  }
  
  if (file === 'AboutScreen.js') {
    content = content.replace(/\{\/\* Top Header Bar \*\/\}[\s\S]*?<\/View>\n/, 
      `{/* Top Header Bar */}\n      <PageHeader \n        title={currentView === 'main' ? 'About ChefStack' : currentView === 'mobile' ? 'Mobile App' : currentView === 'documentation' ? 'Technical Docs' : currentView === 'changelog' ? 'Changelog' : 'Privacy Policy'}\n        subtitle="Version 1.2.0"\n        icon="information-circle-outline"\n        onBack={handleBack}\n        rightComponent={\n          currentView !== 'main' ? (\n            <TouchableOpacity style={[styles.backToAboutPill, { backgroundColor: colors.primary + '15' }]} onPress={() => setCurrentView('main')}>\n              <Ionicons name="chevron-back" size={16} color={colors.primary} />\n              <Text style={[styles.backToAboutText, { color: colors.primary }]}>Back</Text>\n            </TouchableOpacity>\n          ) : null\n        }\n      />\n`
    );
  }

  if (file === 'ProfileScreen.js') {
    content = content.replace(/<View style=\{\[styles\.header, \{ backgroundColor: colors\.background \}\]\}>[\s\S]*?<View style=\{\{\s*width:\s*44\s*\}\}\s*\/>\n\s*<\/View>/, 
      `<PageHeader title="Profile" subtitle="Manage your account" icon="person-outline" onBack={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')} />`
    );
  }

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
