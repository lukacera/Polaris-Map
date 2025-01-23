export interface PropFilterQuery {
    propertyTypes?: string[];
    minPrice?: number; 
    maxPrice?: number; 
    rooms?: string[];
    status?: "Rent" | "Buy";
}