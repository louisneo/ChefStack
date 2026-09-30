import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View, TouchableOpacity, Platform, StyleSheet, useWindowDimensions, Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { RecipeProvider, useRecipes } from '../context/RecipeContext';
import AddRecipeModal from '../components/AddRecipeModal';
import { supabase } from '../lib/supabase';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import HelpScreen from '../screens/HelpScreen';
import AboutScreen from '../screens/AboutScreen';
import AISearchScreen from '../screens/AISearchScreen';

import TermsScreen from '../screens/TermsScreen';
import CookiePolicyScreen from '../screens/CookiePolicyScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Dummy screen for the "Add" tab (never actually navigated to)
function AddPlaceholder() { return null; }

// Floating Bottom Navigation Bar Component (Matches screenshot design)
function FloatingTabBar({ state, descriptors, navigation }) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <View style={styles.floatingContainerWrapper} pointerEvents="box-none">
      <View style={[
        styles.floatingBar, 
        { 
          backgroundColor: colors.surface, 
          borderColor: colors.borderLight,
          width: isDesktop ? 500 : '90%',
          shadowColor: isDark ? '#ffffff' : '#000000',
          shadowOpacity: isDark ? 0.1 : 0.08,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 12,
          elevation: 10,
        }
      ]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName = 'ellipse-outline';
          if (route.name === 'Home') {
            iconName = isFocused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Favorites') {
            iconName = isFocused ? 'heart' : 'heart-outline';
          } else if (route.name === 'AISearch') {
            iconName = isFocused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'About') {
            iconName = isFocused ? 'information-circle' : 'information-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = isFocused ? 'person' : 'person-outline';
          }

          const activeColor = colors.primary;
          const inactiveColor = colors.textSecondary;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || (typeof label === 'string' ? label : route.name)}
              onPress={onPress}
              style={styles.floatingTabItem}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={iconName} 
                size={22} 
                color={isFocused ? activeColor : inactiveColor} 
              />
              <Text style={[
                styles.floatingTabLabel, 
                { color: isFocused ? activeColor : inactiveColor, fontWeight: isFocused ? '700' : '500' }
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// Bottom Tab Navigator with custom Floating Pill Navbar
function BottomTabNavigator() {
  return (
    <Tab.Navigator
      backBehavior="initialRoute"
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={DashboardScreen} 
        options={{ tabBarLabel: 'Recipes' }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={DashboardScreen} 
        initialParams={{ filterFavorites: true }}
        options={{ tabBarLabel: 'Favorites' }}
      />
      <Tab.Screen 
        name="AISearch" 
        component={AISearchScreen} 
        options={{ tabBarLabel: 'AI Chef' }}
      />
      <Tab.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ tabBarLabel: 'About' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Responsive Main Navigator (Uses Floating Pill Bar for PC and Mobile)
function ResponsiveMainNavigator(props) {
  return <BottomTabNavigator {...props} />;
}

const linking = {
  prefixes: ['chefstack://', 'https://chefstack.vercel.app', 'http://localhost:8081', 'http://localhost:19006'],
  config: {
    screens: {
      MainTabs: {
        path: '',
        initialRouteName: 'Home',
        screens: {
          Home: '',
          Favorites: 'favorites',
          AddRecipe: 'add',
          AISearch: 'ai',
          About: 'about',
          Profile: 'profile'
        }
      },
      Notifications: 'notifications',
      Privacy: 'privacy',
      Terms: 'terms',
      CookiePolicy: 'cookies',
      Help: 'help',
      About: 'about',
      Login: 'login',
      Signup: 'signup'
    }
  }
};

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer 
      linking={linking}
      fallback={
        <View style={{ flex: 1, backgroundColor: colors.background }} />
      }
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs">
              {(props) => (
                <RecipeProvider>
                  <ResponsiveMainNavigator {...props} />
                  <RecipeConsumer />
                </RecipeProvider>
              )}
            </Stack.Screen>
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
            <Stack.Screen name="CookiePolicy" component={CookiePolicyScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
            <Stack.Screen name="CookiePolicy" component={CookiePolicyScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Separate component to consume RecipeContext inside the Provider
function RecipeConsumer() {
  const { addModalVisible, closeAddRecipe, editingRecipe, saveRecipe } = useRecipes();

  const handleSave = async (data) => {
    const { error } = await saveRecipe(data);
    if (!error) {
      closeAddRecipe();
    }
  };

  return (
    <AddRecipeModal
      visible={addModalVisible}
      onClose={closeAddRecipe}
      onSave={handleSave}
      editingRecipe={editingRecipe}
    />
  );
}

const styles = StyleSheet.create({
  floatingContainerWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 24 : (Platform.OS === 'ios' ? 30 : 20),
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  floatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
  },
  floatingTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  floatingTabLabel: {
    fontSize: 11,
    marginTop: 3,
    textAlign: 'center',
  },
});
