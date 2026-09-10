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

// Bottom Tab Navigator with center FAB
function BottomTabNavigator() {
  const { colors } = useTheme();
  const { openAddRecipe } = useRecipes();

  return (
    <Tab.Navigator
      backBehavior="initialRoute"
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
            const { onPress, href, onClick, ...restProps } = props;
            return (
              <TouchableOpacity
                {...restProps}
                onPress={() => openAddRecipe()}
                style={styles.addButtonContainer}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.addButton, 
                  { 
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.35,
                    shadowRadius: 8,
                    elevation: 8,
                  }
                ]}>
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

// Custom Sidebar Drawer Content
function CustomDrawerContent(props) {
  const { colors } = useTheme();
  const { openAddRecipe } = useRecipes();
  const { isCollapsed, toggleCollapsed } = props;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <DrawerContentScrollView 
        {...props} 
        contentContainerStyle={{ paddingTop: 0 }}
        style={{ flex: 1 }}
      >
        {/* Header Branding + Collapse Toggle (3 lines / hamburger menu) */}
        <View style={{ 
          padding: isCollapsed ? 12 : 20, 
          flexDirection: 'row',
          alignItems: 'center', 
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottomWidth: 1, 
          borderBottomColor: colors.borderLight, 
          marginBottom: 12 
        }}>
          {!isCollapsed && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Image 
                source={require('../../assets/chefstack_logo.png')} 
                style={{ width: 36, height: 36, borderRadius: 10 }} 
              />
              <View>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>ChefStack</Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary }}>Recipe Manager</Text>
              </View>
            </View>
          )}

          <TouchableOpacity 
            onPress={toggleCollapsed}
            style={{ 
              padding: 8, 
              borderRadius: 8, 
              backgroundColor: colors.borderLight + '40',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            accessibilityLabel="Toggle Sidebar"
          >
            <Ionicons 
              name="menu" 
              size={22} 
              color={colors.text} 
            />
          </TouchableOpacity>
        </View>

        <DrawerItemList {...props} />

        {/* New Recipe Button (inside upper nav items area) */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'center',
            backgroundColor: colors.primary,
            marginHorizontal: isCollapsed ? 8 : 16,
            marginVertical: 12,
            paddingVertical: 12,
            paddingHorizontal: isCollapsed ? 0 : 16,
            borderRadius: 14,
            gap: isCollapsed ? 0 : 10
          }}
          onPress={() => openAddRecipe()}
        >
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          {!isCollapsed && (
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 }}>New Recipe</Text>
          )}
        </TouchableOpacity>
      </DrawerContentScrollView>

      {/* Bottom Section: ONLY Profile */}
      <View style={{ 
        padding: isCollapsed ? 10 : 16, 
        borderTopWidth: 1, 
        borderTopColor: colors.borderLight, 
        backgroundColor: colors.surface,
      }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            paddingVertical: 10,
            paddingHorizontal: isCollapsed ? 0 : 12,
            borderRadius: 12,
            backgroundColor: props.state.routes[props.state.index]?.name === 'Profile' ? colors.primary + '15' : 'transparent',
            gap: 12
          }}
          onPress={() => props.navigation.navigate('Profile')}
        >
          <Ionicons 
            name={props.state.routes[props.state.index]?.name === 'Profile' ? "person-circle" : "person-circle-outline"} 
            size={24} 
            color={props.state.routes[props.state.index]?.name === 'Profile' ? colors.primary : colors.textSecondary} 
          />
          {!isCollapsed && (
            <Text style={{ 
              fontSize: 15, 
              fontWeight: '600', 
              color: props.state.routes[props.state.index]?.name === 'Profile' ? colors.primary : colors.text 
            }}>
              Profile
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Drawer Navigator for Desktop / Web / Windows screens
function WebDrawerNavigator() {
  const { colors } = useTheme();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawerContent 
          {...props} 
          isCollapsed={isCollapsed} 
          toggleCollapsed={() => setIsCollapsed(!isCollapsed)} 
        />
      )}
      screenOptions={{
        headerShown: false,
        drawerType: 'permanent',
        drawerStyle: {
          width: isCollapsed ? 76 : 250,
          backgroundColor: colors.surface,
          borderRightColor: colors.borderLight,
          borderRightWidth: 1,
        },
        drawerActiveBackgroundColor: colors.primary + '15',
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: '600',
          marginLeft: -10,
          display: isCollapsed ? 'none' : 'flex',
        },
        drawerItemStyle: {
          justifyContent: isCollapsed ? 'center' : 'flex-start',
        }
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={DashboardScreen} 
        options={{
          drawerLabel: 'Recipes',
          drawerIcon: ({ color }) => <Ionicons name="restaurant-outline" size={22} color={color} />
        }}
      />
      <Drawer.Screen 
        name="Favorites" 
        component={DashboardScreen} 
        initialParams={{ filterFavorites: true }}
        options={{
          drawerLabel: 'Favorites',
          drawerIcon: ({ color }) => <Ionicons name="heart-outline" size={22} color={color} />
        }}
      />
      <Drawer.Screen 
        name="AISearch" 
        component={AISearchScreen} 
        options={{
          drawerLabel: 'AI Chef',
          drawerIcon: ({ color }) => <Ionicons name="sparkles-outline" size={22} color={color} />
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          drawerLabel: 'Profile',
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer.Navigator>
  );
}

// Responsive Main Navigator (Uses Drawer on Web/Desktop/Windows >= 768px, Tabs on Mobile < 768px)
function ResponsiveMainNavigator(props) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  if (isDesktop) {
    return <WebDrawerNavigator {...props} />;
  }

  return <BottomTabNavigator {...props} />;
}

const linking = {
  prefixes: ['chefstack://', 'https://chefstack.vercel.app'],
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
    <NavigationContainer linking={linking}>
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
            <Stack.Screen name="Terms" component={TermsScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="CookiePolicy" component={CookiePolicyScreen} />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});
