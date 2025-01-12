export type PropFormData = {
    price: string;
    type: "Apartment" | "House" | "Condo";
    size: string;
    rooms: string;
    yearBuilt: string;
    status: "Buy" | "Rent" | "Lease";
    coordinates: [string, string];
};
  