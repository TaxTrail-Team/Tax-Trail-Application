// App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, Image } from 'react-native';

import { useAuth } from './src/store/useAuth';
import Onboarding from './src/screens/OnBoarding';
import Login from './src/screens/Login';
import Signup from './src/screens/Signup';
import Home from './src/screens/Home';
import Profile from './src/screens/Profile';
import Converter from './src/screens/Converter';
import LiveRates from './src/screens/LiveRates';

import BudgetDashboard from './src/screens/BudgetDashboard';
import BudgetFilter from './src/screens/BudgetFilter';
import CategoryOverview from './src/screens/CategoryOverview';
import Anomaly from './src/screens/Anomaly';
import home from './src/assets/home.png';
import converter from './src/assets/converter.png';
import budget from './src/assets/budget.png';
import anomaly from './src/assets/anomaly.png';
import prediction from './src/assets/prediction.png';
import profile from './src/assets/profile.png';



import PredictionScreen from "./src/screens/PredictionScreen";
import SummaryScreen from "./src/screens/SummaryScreen";
import { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const Stack2 = createNativeStackNavigator<RootStackParamList>();

// NEW CODE
const PredictionStack = createNativeStackNavigator();

function PredictionStackNavigator() {
  return (
    <PredictionStack.Navigator>
      <PredictionStack.Screen
        name="PredictionScreen"
        component={PredictionScreen}
        options={{ headerShown: false }}
      />
      <PredictionStack.Screen
        name="SummaryScreen"
        component={SummaryScreen}
        options={{
          presentation: "modal",
          headerShown: true,
          title: "AI Summary",
        }}
      />
    </PredictionStack.Navigator>
  );
}

function TabsNav() {
  const Placeholder = ({ title }: { title: string }) => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{title}</Text>
    </View>
  );

  return (

   <Tabs.Navigator screenOptions={{ headerShown: true }}>
  {/* <Tabs.Screen
    name="Home"
    component={Home}
    options={{
      tabBarIcon: ({ focused }) => (
        <Image
          source={require('./src/assets/home.png')}
          style={{ width: 24, height: 24, tintColor: focused ? '#22c55e' : '#555' }}
        />
      ),
    }}
  /> */}
  <Tabs.Screen
    name="Converter"
    component={Converter}
    options={{
      tabBarIcon: ({ focused }) => (
        <Image
          source={require('./src/assets/converter.png')}
          style={{ width: 24, height: 24, tintColor: focused ? '#22c55e' : '#555' }}
        />
      ),
    }}
  />
  <Tabs.Screen
    name="Budget Breakdown"
    component={BudgetDashboard}
    options={{
      tabBarIcon: ({ focused }) => (
        <Image
          source={require('./src/assets/budget.png')}
          style={{ width: 24, height: 24, tintColor: focused ? '#22c55e' : '#555' }}
        />
      ),
    }}
  />
  <Tabs.Screen
    name="Anomaly Viewer"
    component={Anomaly}
    options={{
      tabBarIcon: ({ focused }) => (
        <Image
          source={require('./src/assets/anomaly.png')}
          style={{ width: 24, height: 24, tintColor: focused ? '#22c55e' : '#555' }}
        />
      ),
    }}
  />
  {/* OLD CODE */}
  {/* <Tabs.Screen name="Predictions" component={PredictionScreen} />
      <Stack2.Screen name="SummaryScreen" component={SummaryScreen} options={{ presentation: "modal", headerShown: true }}/> */}
  <Tabs.Screen
    name="prediction"
    component={PredictionStackNavigator}
    options={{
      tabBarIcon: ({ focused }) => (
        <Image
          source={require('./src/assets/prediction.png')}
          style={{ width: 24, height: 24, tintColor: focused ? '#22c55e' : '#555' }}
        />
      ),
    }}
  />
  <Tabs.Screen
    name="Profile"
    component={Profile}
    options={{
      tabBarIcon: ({ focused }) => (
        <Image
          source={require('./src/assets/profile.png')}
          style={{ width: 24, height: 24, tintColor: focused ? '#22c55e' : '#555' }}
        />
      ),
    }}
  />
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
            {/* Extra screens on ROOT stack so any tab can push them */}
            <Stack.Screen
              name="LiveRates"
              component={LiveRates}
              options={{ headerShown: true, title: 'Live Rate Changes' }}
            />
            <Stack.Screen
              name="BudgetFilter"
              component={BudgetFilter}
              options={{ headerShown: true, title: 'Filters' }}
            />
            <Stack.Screen
              name="CategoryOverview"
              component={CategoryOverview}
              options={{ headerShown: true, title: 'Overview' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
