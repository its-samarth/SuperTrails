import React, { useEffect } from 'react';
import { View, Text } from 'react-native';

const TestGoogleApi = () => {
  useEffect(() => {
    const apiKey = 'YOUR_GOOGLE_API_KEY'; 
    const testAddress = '1600 Amphitheatre Parkway, Mountain View, CA'; 

    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(testAddress)}&key=${apiKey}`;

    const testGoogleApi = async () => {
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === 'OK') {
          console.log('API is working, result:', data.results[0].formatted_address);
        } else {
          console.error('API error:', data.status);
        }
      } catch (error) {
        console.error('Error testing API:', error);
      }
    };

    testGoogleApi();
  }, []);

  return (
    <View>
      <Text>Test Google API - Check console logs for results</Text>
    </View>
  );
};

export default TestGoogleApi;
