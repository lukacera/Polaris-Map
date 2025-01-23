export interface FilterState {
    propertyTypes: string[];
    minPrice: number;
    maxPrice: number;
    rooms: string[];
    status: "Rent" | "Buy";
}