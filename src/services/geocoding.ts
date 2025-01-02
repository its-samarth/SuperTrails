import { config } from '../config';
  import { Coordinates, AddressDetails } from '../types/address';
  
  export const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number
  ): Promise<AddressDetails> => {
    try {
      const response = await fetch(
        `${config.geocodingApiUrl}?latlng=${latitude},${longitude}&key=${config.googleMapsApiKey}`
      );
      const data = await response.json();
  
      if (data.results && data.results.length > 0) {
        const address = data.results[0];
        const components = address.address_components;
  
        const postalCode = components.find((component: any) => 
          component.types.includes('postal_code')
        )?.long_name;
  
        const city = components.find((component: any) => 
          component.types.includes('locality')
        )?.long_name;
  
        const state = components.find((component: any) => 
          component.types.includes('administrative_area_level_1')
        )?.long_name;
  
        return {
          formattedAddress: address.formatted_address,
          postalCode,
          city,
          state,
        };
      }
      throw new Error('No address found');
    } catch (error) {
      console.error('Error fetching address:', error);
      throw error;
    }
  };