export interface Customer {
  id: number;
  name: string;
  email: string;
  phone_no: string;
  loyalty_points: number;
}

export interface CreateCustomerRequest {
  first_name: string;
  last_name: string;
  phone_no: string;
}