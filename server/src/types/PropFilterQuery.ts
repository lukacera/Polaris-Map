export interface PropFilterQuery {
    propertyTypes?: string[];
    minPrice?: number; 
    maxPrice?: number; 
    bedrooms?: string[];
    status?: "Rent" | "Buy";
}