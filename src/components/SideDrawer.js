import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ChefStackLogo from './ChefStackLogo';

export default function SideDrawerContent(props) {
  const { user, signOut } = useAuth();
  
  // Get active route name
  const activeRoute = props.state.routes[props.state.index].name;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <ChefStackLogo size={40} withBackground={true} />
              <Text style={styles.logoText}>ChefStack</Text>
            </View>
            <TouchableOpacity onPress={() => props.navigation.closeDrawer()} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          {user && (
            <TouchableOpacity 
              style={styles.userInfo} 
              onPress={() => props.navigation.navigate('Profile')}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.user_metadata?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName} numberOfLines={1}>{user.user_metadata?.full_name || 'Chef'}</Text>
                <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>MENU</Text>

          <TouchableOpacity 
            style={[styles.menuItem, activeRoute === 'MainTabs' && styles.menuItemActive]} 
            onPress={() => {
              props.navigation.navigate('MainTabs', { screen: 'Home' });
              props.navigation.closeDrawer();
            }}
          >
            <Ionicons name="restaurant" size={24} color={activeRoute === 'MainTabs' ? colors.primary : colors.textSecondary} />
            <Text style={activeRoute === 'MainTabs' ? styles.menuItemTextActive : styles.menuItemText}>My Recipes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              props.navigation.navigate('MainTabs', { screen: 'Favorites' });
              props.navigation.closeDrawer();
            }}
          >
            <Ionicons name="heart" size={24} color={colors.textSecondary} />
            <Text style={styles.menuItemText}>Favorites</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              props.navigation.navigate('MainTabs', { screen: 'AISearch' });
              props.navigation.closeDrawer();
            }}
          >
            <Ionicons name="sparkles" size={24} color={colors.textSecondary} />
            <Text style={styles.menuItemText}>AI Recipe Finder</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              props.navigation.navigate('MainTabs', { screen: 'Profile' });
              props.navigation.closeDrawer();
            }}
          >
            <Ionicons name="person-circle-outline" size={28} color={colors.textSecondary} />
            <Text style={styles.menuItemText}>Profile</Text>
          </TouchableOpacity>

        </View>
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingTop: Platform.OS === 'web' ? 5 : 60,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  menuContainer: {
    padding: 20,
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
    gap: 16,
  },
  menuItemActive: {
    backgroundColor: colors.primaryLight,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  menuItemTextActive: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.error,
  }
});
