export interface FilterState {
    propertyTypes: string[];
    minPrice: number;
    maxPrice: number;
    bedrooms: string[];
    status: "Rent" | "Buy";
}