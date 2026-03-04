from django.db import models
from django.core.validators import RegexValidator, MaxValueValidator,MinValueValidator


# Create your models here.
class Employee(models.Model):
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

    name = models.CharField(max_length=100)
    gender = models.IntegerField(choices=GenderChoices.choices)
    email = models.EmailField(max_length=100, unique=True)
    phone_no = models.CharField(max_length=10, unique=True)
    role = models.IntegerField(choices=RoleChoices.choices)
    monthly_salary = models.FloatField(help_text="The monthly salary in INR")
    joining_date = models.DateField(auto_now_add=True)
    is_working = models.BooleanField(default=True)
    leaving_date = models.DateField(null=True, blank=True)
    

    class Meta:
        unique_together = ("email", "phone_no")

    def __str__(self):
        return f'{self.name} - {self.role}'
    

class SalarySlip(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date_paid = models.DateField(auto_now_add=True)
    total_amount = models.FloatField()
    transaction_no = models.CharField(
                    max_length=100, 
                    validators=[
                        RegexValidator(
                            regex=r'^Tr[0-9]+',
                            message='Transaction number must start with "Tr" followed by a number'
                        )
                    ],
                    unique=True
                    )
    
    class Meta:
        unique_together = ("employee", "transaction_no")

    def __str__(self):
        return f"{self.employee.name} received {self.total_amount} on {self.date_paid}"
    

class SalarySlipBreakdown(models.Model):
    """
    Salary Slip Breakdown Table
    """
    class TypeChoices(models.IntegerChoices):
        INCREMENT = 1, "Increment"
        DEDUCTION = -1, "Deduction"

    salary_slip = models.ForeignKey(SalarySlip, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, help_text="Name of the part of salary it is, like 'Basic Pay'")
    amount = models.FloatField()
    type_pay = models.IntegerField(choices=TypeChoices.choices)


    class Meta:
        unique_together = ("salary_slip", "name")

    def __str__(self):
        return f"{self.name} - {self.amount}"