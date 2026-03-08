from django.db import models
from django.core.validators import RegexValidator, MaxValueValidator,MinValueValidator
from core.models import TimeStampedModel

# Create your models here.
class Employee(TimeStampedModel):
    """
    Table for the details of employees.
    """

    class RoleChoices(models.IntegerChoices):
        OWNER = 0, "Owner"
        MANAGER = 1, "Manager"
        INVENTORY_MANAGER = 2, "Inventory Manager"
        ACCOUNTS = 3, "Accounts"
        CHEF = 4, "Chef"
        WAITER = 5, "Waiter"
        HOUSEKEEPING = 6, "Housekeeping"
        WATCHMAN = 7, "Watchman"

    class GenderChoices(models.IntegerChoices):
        MALE = 0, "Male"
        FEMALE = 1, "Female"

    first_name = models.CharField(max_length=100, db_column="first_name")
    last_name = models.CharField(max_length=100, db_column="last_name")
    gender = models.IntegerField(choices=GenderChoices.choices, db_column="gender")
    email = models.EmailField(max_length=100, unique=True, db_column="email")
    phone_no = models.CharField(max_length=10, unique=True, db_column="phone_no")
    role = models.IntegerField(choices=RoleChoices.choices, db_column="role")
    monthly_salary = models.FloatField(help_text="The monthly salary in INR", db_column="monthly_salary")
    joining_date = models.DateField(auto_now_add=True, db_column="joining_date")
    is_working = models.BooleanField(default=True, db_column="is_working")
    leaving_date = models.DateField(null=True, blank=True, db_column="leaving_date")


    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    

    class Meta:
        unique_together = ("email", "phone_no")

    def __str__(self):
        return f'{self.name} - {self.role}'
    

class SalarySlip(TimeStampedModel):
    """
    Table to record salary slip details for an employee, including the transaction reference and total amount paid.
    """
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, db_column="employee_id")
    date_paid = models.DateField(auto_now_add=True, db_column="date_paid")
    total_amount = models.FloatField(db_column="total_amount")
    transaction_no = models.CharField(
                    max_length=100, 
                    validators=[
                        RegexValidator(
                            regex=r'^Tr[0-9]+',
                            message='Transaction number must start with "Tr" followed by a number'
                        )
                    ],
                    unique=True,
                    db_column="transaction_no"
                    )
    
    class Meta:
        unique_together = ("employee", "transaction_no")

    def __str__(self):
        return f"{self.employee.name} received {self.total_amount} on {self.date_paid}"
    

class SalarySlipBreakdown(TimeStampedModel):
    """
    Salary Slip Breakdown Table
    """
    class TypeChoices(models.IntegerChoices):
        INCREMENT = 1, "Increment"
        DEDUCTION = -1, "Deduction"

    salary_slip = models.ForeignKey(SalarySlip, on_delete=models.CASCADE, db_column="salary_slip_id")
    name = models.CharField(max_length=100, help_text="Name of the part of salary it is, like 'Basic Pay'", db_column="name")
    amount = models.FloatField(db_column="amount")
    type_pay = models.IntegerField(choices=TypeChoices.choices, db_column="type_pay")


    class Meta:
        unique_together = ("salary_slip", "name")

    def __str__(self):
        return f"{self.name} - {self.amount}"


class Shifts(TimeStampedModel):
    """
    A table to store the details of shifts for employees.
    """
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, db_column="employee_id")
    start_time = models.TimeField(db_column="start_time")
    end_time = models.TimeField(db_column="end_time")


    @property
    def work_hours(self):
        """
        Under the scanner
        """
        return self.end_time - self.start_time

    class Meta:
        verbose_name = "Shift"
        verbose_name_plural = "Shifts"

    def __str__(self):
        return f"{self.employee.full_name}"     