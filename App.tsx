import 'react-native-get-random-values';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { store } from './src/store';

import AddressList from './src/screens/AddressList';
import AddressForm from './src/screens/AddressForm';
import MapScreen from './src/screens/MapScreen';
import { RootStackParamList } from './src/navigation/types';
const Stack = createStackNavigator<RootStackParamList>();



const App: React.FC = () => {
  
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
        <Stack.Screen 
            name="AddressList" 
            component={AddressList} 
            options={{ title: 'My Addresses' }} 
          /> 
        <Stack.Screen 
            name="MapScreen" 
            component={MapScreen} 
            options={{ title: 'Select Location' }} 
          />
        <Stack.Screen 
            name="AddressForm" 
            component={AddressForm} 
            options={{ title: 'Add Address' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;