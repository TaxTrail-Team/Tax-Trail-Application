import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  PredictionScreen: undefined;
  SummaryScreen: {
    summary: string;
  };
  // Other screens can be added here
};

export type PredictionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PredictionScreen'
>;

// // Add other screen-specific navigation types here
// export type SummaryScreenNavigationProp = NativeStackNavigationProp<
//   RootStackParamList,
//   'SummaryScreen'
// >;