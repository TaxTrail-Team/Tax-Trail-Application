// App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator } from 'react-native';

import { useAuth } from './src/store/useAuth';
import Onboarding from './src/screens/OnBoarding';
import Login from './src/screens/Login';
import Signup from './src/screens/Signup';
import Home from './src/screens/Home';
import Profile from './src/screens/Profile';
import Converter from './src/screens/Converter';
import LiveRates from './src/screens/LiveRates';
import BudgetDashboard from './src/screens/BudgetDashboard';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function TabsNav() {
  const Placeholder = ({ title }: { title: string }) => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{title}</Text>
    </View>
  );

  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Home" component={Home} />
      <Tabs.Screen name="Profile" component={Profile} />
      <Tabs.Screen name="Converter" component={Converter} />
      <Tabs.Screen name="Budget" component={BudgetDashboard} />
      <Tabs.Screen name="More2">{() => <Placeholder title="More 2" />}</Tabs.Screen>
      <Tabs.Screen name="More3">{() => <Placeholder title="More 3" />}</Tabs.Screen>
    </Tabs.Navigator>
  );
}

export default function App() {
  const { user, loading, onboarded, setOnboarded, bootstrap } = useAuth();

  useEffect(() => {
    bootstrap();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!onboarded ? (
          <Stack.Screen name="Onboarding">
            {() => <Onboarding onDone={() => setOnboarded(true)} />}
          </Stack.Screen>
        ) : !user ? (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
          </>
        ) : (
          <>
            {/* Tabs at the bottom */}
            <Stack.Screen name="Tabs" component={TabsNav} />
            {/* LiveRates sits in the ROOT stack so any tab can push it */}
            <Stack.Screen
              name="LiveRates"
              component={LiveRates}
              options={{ headerShown: true, title: 'Live Rate Changes' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
