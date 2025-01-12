import { PropFormData } from "../types/PropFormData";

const isValidLatitude = (lat: string): boolean => {
    const num = Number(lat);
    return !isNaN(num) && num >= -90 && num <= 90;
};
  
const isValidLongitude = (lng: string): boolean => {
    const num = Number(lng);
    return !isNaN(num) && num >= -180 && num <= 180;
};
  
interface FormErrors {
    price?: string;
    size?: string;
    rooms?: string;
    yearBuilt?: string;
    coordinates?: string[];
}
  
export const validateForm = (data: PropFormData): FormErrors => {
    const errors: FormErrors = {};
  
    if (!data.price || Number(data.price) <= 0) {
      errors.price = "Price must be a positive number";
    }
  
    if (!data.size || Number(data.size) <= 0) {
      errors.size = "Size must be a positive number";
    }
  
    if (!data.rooms || Number(data.rooms) <= 0) {
      errors.rooms = "Number of rooms must be a positive number";
    }
  
    const currentYear = new Date().getFullYear();
    const yearBuilt = Number(data.yearBuilt);
    if (!yearBuilt || yearBuilt < 1800 || yearBuilt > currentYear) {
      errors.yearBuilt = `Year must be between 1800 and ${currentYear}`;
    }
  
    const coordErrors: string[] = [];
  
    if (!isValidLongitude(data.coordinates[0])) {
      coordErrors[0] = "Longitude must be between -180 and 180";
    }
  
    if (!isValidLatitude(data.coordinates[1])) {
      coordErrors[1] = "Latitude must be between -90 and 90";
    }
  
    if (coordErrors.length > 0) {
        errors.coordinates = coordErrors;
    }

    return errors;
};
  