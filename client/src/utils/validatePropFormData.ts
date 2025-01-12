import { PropFormData } from "../types/PropFormData";

const isValidLatitude = (lat: string): boolean => {
  if (lat === "") {
    return false;
  }
  const num = Number(lat);
  return !isNaN(num) && num >= -90 && num <= 90;
};
  
const isValidLongitude = (lng: string): boolean => {
  if (lng === "") {
    return false;
  }
  const num = Number(lng);
  return !isNaN(num) && num >= -180 && num <= 180;
};
  
  
export const validateForm = (data: PropFormData): string[] => {
  const errors: string[] = [];

  if (!data.price || Number(data.price) <= 0) {
    errors.push("Price must be a positive number");
  }

  if (!data.size || Number(data.size) <= 0) {
    errors.push("Size must be a positive number");
  }

  if (!data.rooms || Number(data.rooms) <= 0) {
    errors.push("Number of rooms must be a positive number");
  }

  const currentYear = new Date().getFullYear();
  const yearBuilt = Number(data.yearBuilt);
  if (!yearBuilt || yearBuilt < 1000 || yearBuilt > currentYear) {
    errors.push(`Year must be between 1000 and ${currentYear}`);
  }

  const coordErrors: string[] = [];

  if (!isValidLongitude(data.coordinates[0])) {
    coordErrors[0] = data.coordinates[0] === "" 
      ? "Longitude cannot be empty"
      : "Longitude must be between -180 and 180";
  }

  if (!isValidLatitude(data.coordinates[1])) {
    coordErrors[1] = data.coordinates[1] === "" 
      ? "Latitude cannot be empty"
      : "Latitude must be between -90 and 90";
  }

  if (coordErrors.length > 0) {
    for (let i = 0; i < coordErrors.length; i++) {
      errors.push(coordErrors[i]);
    }
  }

  return errors;
};