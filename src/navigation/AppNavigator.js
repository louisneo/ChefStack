import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Dummy screen for the "Add" tab (never actually navigated to)
function AddPlaceholder() { return null; }

// Bottom Tab Navigator with center FAB
function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: Platform.OS === 'web' ? 4 : 2,
        },
        tabBarStyle: {
          height: Platform.OS === 'web' ? 60 : 85,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'web' ? 8 : 28,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'AddRecipe') {
            return null;
          } else if (route.name === 'AISearch') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        }
      })}
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
        name="AddRecipe" 
        component={AddPlaceholder}
        options={({ navigation }) => ({
          tabBarLabel: () => null,
          tabBarButton: (props) => {
            // Remove the default onPress from props so it doesn't try to navigate to AddRecipe
            const { onPress, ...restProps } = props;
            return (
              <TouchableOpacity
                {...restProps}
                onPress={() => navigation.navigate('Home', { openAdd: Date.now() })}
                style={styles.addButtonContainer}
                activeOpacity={0.8}
              >
                <View style={styles.addButton}>
                  <Ionicons name="add" size={32} color={colors.surface} />
                </View>
              </TouchableOpacity>
            );
          },
        })}
      />
      <Tab.Screen 
        name="AISearch" 
        component={AISearchScreen} 
        options={{ tabBarLabel: 'AI Chef' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  addButtonContainer: {
    top: Platform.OS === 'web' ? -10 : -15,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});
