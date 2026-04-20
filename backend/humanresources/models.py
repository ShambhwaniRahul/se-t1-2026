from django.db import models
from django.core.validators import RegexValidator
from core.models import TimeStampedModel
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from datetime import datetime, date, timedelta



"""
TThis one, which is commeneted out was when we had the Employee and their roles in one table.
"""
# class EmployeeManager(BaseUserManager):
#     """
#     Handles user creation lifecycle for the custom Employee authentication model.
#     Enforces password hashing and superuser flag assignment.
#     """
#     def create_user(self, phone_no, password=None, **extra_fields):
#         if not phone_no:
#             raise ValueError('The phone_no identifier must be set')
#         user = self.model(phone_no=phone_no, **extra_fields)
#         user.set_password(password)
#         user.save(using=self._db)
#         return user

#     def create_superuser(self, phone_no, password=None, **extra_fields):
#         extra_fields.setdefault('is_staff', True)
#         extra_fields.setdefault('is_superuser', True)
#         return self.create_user(phone_no, password, **extra_fields)


class EmployeeManager(BaseUserManager):

    def create_user(self, phone_no, password=None, **extra_fields):
        if not phone_no:
            raise ValueError('The phone_no identifier must be set')

        user = self.model(phone_no=phone_no, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, phone_no, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        user = self.create_user(phone_no, password, **extra_fields)

        # 🔥 Assign OWNER role automatically
        from .models import EmployeeRole

        EmployeeRole.objects.create(
            employee=user,
            role=EmployeeRole.RoleChoices.OWNER
        )

        return user



class Employee(AbstractBaseUser, PermissionsMixin, TimeStampedModel):

    class GenderChoices(models.IntegerChoices):
        MALE = 0, "Male"
        FEMALE = 1, "Female"

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    gender = models.IntegerField(choices=GenderChoices.choices, default=GenderChoices.MALE)
    email = models.EmailField(max_length=100, unique=True, null=True, blank=True)
    phone_no = models.CharField(max_length=15, unique=True, db_index=True)


    monthly_salary = models.FloatField(
        help_text="The monthly salary in INR",
        db_column="monthly_salary",
        null=True,
        blank=True
    )

    joining_date = models.DateField(auto_now_add=True)
    leaving_date = models.DateField(null=True, blank=True)

    is_working = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = EmployeeManager()

    USERNAME_FIELD = 'phone_no'
    REQUIRED_FIELDS = ['first_name', 'monthly_salary']

    class Meta:
        verbose_name = "Employee"
        verbose_name_plural = "Employees"

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip() if self.last_name else f"{self.first_name}".strip()

    @property
    def role_names(self):
        return [role.get_role_display() for role in self.employeerole_set.all()]

    def __str__(self) -> str:
        roles = ", ".join(self.role_names)
        return f"{self.full_name} - {roles}"


class EmployeeRole(models.Model):
    """
    Junction table to assign multiple roles to an employee
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

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, db_column="employee_id")
    role = models.IntegerField(choices=RoleChoices.choices, db_column="role")

    class Meta:
        unique_together = ("employee", "role") 

    def __str__(self):
        return f"{self.employee.full_name} - {self.get_role_display()}"

    

class SalarySlip(TimeStampedModel):
    """
    Stores finalized monthly salary payments.
    """
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='salary_slips')
    month = models.CharField(max_length=7)  # YYYY-MM
    base_salary = models.FloatField()
    overtime_hours = models.FloatField(default=0)
    bonuses = models.FloatField(default=0)
    deductions = models.FloatField(default=0)
    net_pay = models.FloatField()
    is_paid = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Salary Slip"
        verbose_name_plural = "Salary Slips"
        # unique_together = ('employee', 'month')

    def __str__(self):
        return f"{self.employee.full_name} - {self.month}"
    

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
        if self.start_time and self.end_time:
            # Combine the time with today's date so Python can do the math
            start_dt = datetime.combine(date.today(), self.start_time)
            end_dt = datetime.combine(date.today(), self.end_time)

            # Handle overnight shifts (if someone works past midnight)
            if self.end_time < self.start_time:
                end_dt += timedelta(days=1)

            return end_dt - start_dt
        return None
    class Meta:
        verbose_name = "Shift"
        verbose_name_plural = "Shifts"

    def __str__(self):
        return f"{self.employee.full_name}"     
    

