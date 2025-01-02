export type RootStackParamList = {

  
    AddressList: undefined;
    AddressForm: { editMode?: boolean; addressId?: string };
    MapScreen: { location?: { lat: number; lng: number } };
    
  };
  
  declare global {
    namespace ReactNavigation {
      interface RootParamList extends RootStackParamList {}
    }
  }