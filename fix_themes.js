const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');

const screensToFix = [
  'TermsScreen.js',
  'HelpScreen.js',
  'CookiePolicyScreen.js',
  'NotificationsScreen.js'
];

screensToFix.forEach(file => {
  const filePath = path.join(screensDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace colors import
  if (content.includes("import { colors } from '../theme/colors';")) {
    content = content.replace(
      "import { colors } from '../theme/colors';",
      "import { useTheme } from '../context/ThemeContext';"
    );
  }

  // Add useTheme inside the component (find the export default function)
  const compRegex = /export default function ([A-Za-z0-9]+)\(\s*([^)]*)\s*\)\s*\{/;
  content = content.replace(compRegex, (match) => {
    return `${match}\n  const { colors, isDark } = useTheme();`;
  });

  // Inject colors.background to the root view
  content = content.replace(/<View style=\{styles\.container\}>/, '<View style={[styles.container, { backgroundColor: colors.background }]}>');

  // Remove static background colors from styles
  content = content.replace(/backgroundColor:\s*colors\.[a-zA-Z]+,?/g, '');

  fs.writeFileSync(filePath, content);
  console.log(`Fixed themes in ${file}`);
});
