import api from "@/lib/api"
import type { Customer } from "../data/crmData";


export const fetchCustomers = async () =>{

    try{
        const result = await api.get("/customers/");

        if (result.data.success){
            console.log(result.data.data);
            
            return result.data.data as Customer[]
        }
        else{
            return result.data.message
        }
    }
    catch(error){
        console.error("Error fetching customers:", error);
        return "Failed to fetch customers";
    }
}

export const fetchcustomerOrdersHistory = async (customerId: string) =>{
    try{
        const result = await api.get(`/customers/${customerId}/orders/`);

        if (result.data.success){
            console.log(result.data.data);
            
            return result.data
        }
        else{
            return result.data
        }
    }
    catch(error){
        console.error("Error fetching customer orders:", error);
        return "Failed to fetch customer orders";
    }
}