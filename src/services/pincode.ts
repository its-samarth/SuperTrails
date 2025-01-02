import { config } from '../config';
  
  interface PincodeResponse {
    city: string;
    state: string;
  }
  
  export const fetchCityState = async (pincode: string): Promise<PincodeResponse | null> => {
    try {
      const response = await fetch(`${config.pincodeApiUrl}/${pincode}`);
      const data = await response.json();
  
      if (data[0]?.Status === 'Success') {
        const postOffice = data[0].PostOffice[0];
        return {
          city: postOffice.District,
          state: postOffice.State,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching pincode data:', error);
      return null;
    }
  };
  