import json
import logging
import random
from typing import List
from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APIRequestFactory
from freezegun import freeze_time

from customers.views import CustomerRegisterView

logger = logging.getLogger(__name__)

customer_names = [
    ("Aarav", "Sharma"), ("Vivaan", "Singh"), ("Aditya", "Kumar"), ("Vihaan", "Patel"), ("Arjun", "Gupta"),
    ("Sai", "Reddy"), ("Reyansh", "Desai"), ("Ayaan", "Joshi"), ("Krishna", "Yadav"), ("Ishaan", "Patil"),
    ("Shaurya", "Jain"), ("Atharva", "Verma"), ("Aaryan", "Rao"), ("Karan", "Iyer"), ("Rahul", "Nair"),
    ("Rohan", "Pillai"), ("Amit", "Das"), ("Manish", "Mukherjee"), ("Rohit", "Banerjee"), ("Neha", "Bose"),
    ("Priya", "Sharma"), ("Sneha", "Singh"), ("Pooja", "Kumar"), ("Anjali", "Patel"), ("Riya", "Gupta"),
    ("Kiran", "Reddy"), ("Kavya", "Desai"), ("Ishita", "Joshi"), ("Shruti", "Yadav"), ("Swati", "Patil"),
    ("Megha", "Jain"), ("Nidhi", "Verma"), ("Sanjay", "Rao"), ("Vikram", "Iyer"), ("Surya", "Nair"),
    ("Vivek", "Pillai"), ("Anand", "Das"), ("Ashok", "Mukherjee"), ("Vijay", "Banerjee"), ("Raj", "Bose"),
    ("Alok", "Sharma"), ("Akash", "Singh"), ("Ankur", "Kumar"), ("Bhavin", "Patel"), ("Chetan", "Gupta"),
    ("Deepak", "Reddy"), ("Dhruv", "Desai"), ("Eshaan", "Joshi"), ("Gaurav", "Yadav"), ("Harsh", "Patil"),
    ("Imran", "Khan"), ("Jatin", "Verma"), ("Kabir", "Rao"), ("Laksh", "Iyer"), ("Madhav", "Nair"),
    ("Naveen", "Pillai"), ("Om", "Das"), ("Pranav", "Mukherjee"), ("Qasim", "Sheikh"), ("Rishi", "Bose"),
    ("Samir", "Sharma"), ("Tarun", "Singh"), ("Utkarsh", "Kumar"), ("Varun", "Patel"), ("Yash", "Gupta"),
    ("Zayed", "Syed"), ("Aisha", "Reddy"), ("Bhumika", "Desai"), ("Chahat", "Joshi"), ("Divya", "Yadav"),
    ("Esha", "Patil"), ("Farah", "Khan"), ("Gauri", "Verma"), ("Heena", "Rao"), ("Isha", "Iyer"),
    ("Juhi", "Nair"), ("Kajal", "Pillai"), ("Lata", "Das"), ("Mansi", "Mukherjee"), ("Nisha", "Banerjee"),
    ("Ojaswi", "Bose"), ("Pallavi", "Sharma"), ("Poonam", "Bhatia"), ("Rachna", "Singh"), ("Sakshi", "Kumar"),
    ("Tanvi", "Patel"), ("Urvi", "Gupta"), ("Vandana", "Reddy"), ("Yamini", "Desai"), ("Zoya", "Joshi"),
    ("Ananya", "Yadav"), ("Bina", "Patil"), ("Chitra", "Jain"), ("Drishti", "Verma"), ("Ekta", "Rao"),
    ("Fatima", "Ansari"), ("Geeta", "Iyer"), ("Hema", "Nair"), ("Indira", "Pillai"), ("Jaya", "Das")
]

class CustomerDataSimulator:
    """
    Executes historical customer generation bypassing DRF permission constraints.
    Utilizes uniformly distributed random timestamps for realistic temporal spacing.
    """

    def __init__(self, years_back_start: int = 3, years_back_end: int = 1):
        """
        Initializes temporal boundaries and the DRF APIRequestFactory.
        """
        self.factory = APIRequestFactory()
        
        current_time = timezone.now()
        self.start_time = current_time - timedelta(days=years_back_start * 365)
        self.end_time = current_time - timedelta(days=years_back_end * 365)
        self.total_duration_seconds = (self.end_time - self.start_time).total_seconds()

    def generate_sorted_random_timestamps(self, total_records: int) -> List[timezone.datetime]:
        """
        Generates a chronologically sorted list of uniformly distributed random timestamps.
        Sorting ensures database primary keys align realistically with temporal progression.
        """
        timestamps = []
        for _ in range(total_records):
            random_seconds = random.uniform(0, self.total_duration_seconds)
            timestamps.append(self.start_time + timedelta(seconds=random_seconds))
            
        return sorted(timestamps)

    def run_customers(self) -> None:
        """
        Generates customer records sequentially using pre-sorted random timestamps.
        Dynamically removes permission classes to bypass the RequiresRole constraint.
        """
        total_customers = len(customer_names)
        
        # Pre-calculate all timestamps to maintain database ID chronology
        timestamps = self.generate_sorted_random_timestamps(total_customers)
        
        # Instantiate view with permissions disabled for simulation scope
        view_function = CustomerRegisterView.as_view(permission_classes=[])
        
        for index in range(total_customers):
            payload = {
                "phone_no": f"{random.randint(1000000000, 9999999999)}",
                "first_name": f"{customer_names[index][0]}",
                "last_name": f"{customer_names[index][1]}"
            }
            
            request = self.factory.post(
                '/api/customers/register/',
                data=json.dumps(payload),
                content_type='application/json'
            )
            
            # Apply the pre-calculated, chronologically sorted timestamp
            with freeze_time(timestamps[index]):
                response = view_function(request)
                
                if response.status_code >= 400:
                    error_msg = f"Customer validation failed at index {index}. Status: {response.status_code}, Payload: {response.data}"
                    logger.error(error_msg)
                    raise ValueError(error_msg)