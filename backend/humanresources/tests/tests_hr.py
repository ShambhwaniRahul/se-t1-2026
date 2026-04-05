import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from humanresources.models import EmployeeRole, Employee, SalarySlip, SalarySlipBreakdown, Shifts
from logs.models import AttendanceLog
from datetime import datetime, time, timedelta


@pytest.fixture
def auth_client(db):
    client = APIClient()
    User = get_user_model()

    user = User.objects.create_user(
        first_name="Test",
        last_name="User",
        gender=0,
        email="test@example.com",
        phone_no="9999999999",
        monthly_salary=10000,
        is_staff=True,
        password="testpass"
    )

    EmployeeRole.objects.create(
        employee=user,
        role=EmployeeRole.RoleChoices.OWNER
    )

    client.force_authenticate(user=user)
    return client

@pytest.fixture
def client_no_auth():
    return APIClient()

@pytest.fixture
def sample_employee(db):
    user = Employee.objects.create_user(
        first_name="Sample",
        last_name="Employee",
        gender=0,
        email="sample@example.com",
        phone_no="8888888888",
        monthly_salary=8000,
        password="samplepass"
    )
    EmployeeRole.objects.create(
        employee=user,
        role=EmployeeRole.RoleChoices.WAITER
    )
    return user

@pytest.fixture
def sample_salary_slip(db, sample_employee):
    return SalarySlip.objects.create(
        employee=sample_employee,
        total_amount=8000.0,
        transaction_no="Tr12345"
    )

@pytest.fixture
def sample_shift(db, sample_employee):
    return Shifts.objects.create(
        employee=sample_employee,
        start_time=time(9, 0),
        end_time=time(17, 0)
    )

@pytest.mark.django_db
class TestEmployeeLoginView:
    def setup_method(self):
        self.url = "/api/v1/hr/auth/login/"

    def test_login_success(self, client_no_auth, auth_client):
        data = {
            "phone_no": "9999999999",
            "password": "testpass"
        }
        response = client_no_auth.post(self.url, data)
        assert response.status_code == 200
        assert response.data["success"] is True
        assert "access" in response.data["data"]
        assert "refresh" in response.data["data"]

    def test_login_missing_fields(self, client_no_auth):
        data = {"phone_no": "9999999999"}
        response = client_no_auth.post(self.url, data)
        assert response.status_code == 400
        assert response.data["success"] is False

    def test_login_invalid_credentials(self, client_no_auth):
        data = {
            "phone_no": "9999999999",
            "password": "wrongpass"
        }
        response = client_no_auth.post(self.url, data)
        assert response.status_code == 401
        assert response.data["success"] is False

@pytest.mark.django_db
class TestEmployeeRegisterView:
    def setup_method(self):
        self.url = "/api/v1/hr/auth/register/"

    def test_register_employee_success(self, auth_client):
        data = {
            "first_name": "New",
            "last_name": "Employee",
            "phone_no": "7777777777",
            "monthly_salary": 7000,
            "password": "newpass",
            "role_ids": [EmployeeRole.RoleChoices.CHEF]
        }
        response = auth_client.post(self.url, data)
        assert response.status_code == 201
        assert response.data["success"] is True
        assert response.data["data"]["phone_no"] == "7777777777"

    def test_register_employee_invalid_role(self, auth_client):
        data = {
            "first_name": "New",
            "last_name": "Employee",
            "phone_no": "7777777777",
            "monthly_salary": 7000,
            "password": "newpass",
            "role_ids": [99]  # Invalid role
        }
        response = auth_client.post(self.url, data)
        assert response.status_code == 400
        assert response.data["success"] is False

@pytest.mark.django_db
class TestEmployeeListView:
    def setup_method(self):
        self.url = "/api/v1/hr/auth/employees/"

    def test_list_employees(self, auth_client, sample_employee):
        response = auth_client.get(self.url)
        assert response.status_code == 200
        assert response.data["success"] is True
        assert len(response.data["data"]) >= 1

@pytest.mark.django_db
class TestEmployeeDetailView:
    def setup_method(self):
        self.sample_employee = None

    def setup_method(self):
        self.sample_employee = Employee.objects.create_user(
            first_name="Detail",
            last_name="Employee",
            phone_no="6666666666",
            monthly_salary=6000,
            password="detailpass"
        )
        EmployeeRole.objects.create(
            employee=self.sample_employee,
            role=EmployeeRole.RoleChoices.WAITER
        )
        self.url = f"/api/v1/hr/auth/employees/{self.sample_employee.id}/"

    def test_get_employee_detail(self, auth_client):
        response = auth_client.get(self.url)
        assert response.status_code == 200
        assert response.data["success"] is True
        assert response.data["data"]["phone_no"] == "6666666666"

    def test_update_employee(self, auth_client):
        data = {"first_name": "Updated"}
        response = auth_client.patch(self.url, data)
        assert response.status_code == 200
        assert response.data["success"] is True
        assert response.data["data"]["first_name"] == "Updated"

    def test_delete_employee(self, auth_client):
        response = auth_client.delete(self.url)
        assert response.status_code == 204
        assert response.data["success"] is True

    def test_get_nonexistent_employee(self, auth_client):
        response = auth_client.get("/api/v1/hr/auth/employees/999/")
        assert response.status_code == 404
        assert response.data["success"] is False

@pytest.mark.django_db
class TestSalarySlipListCreateAPIView:
    def setup_method(self):
        self.url = "/api/v1/hr/auth/salary-slips/"

    def test_list_salary_slips(self, auth_client, sample_salary_slip):
        response = auth_client.get(self.url)
        assert response.status_code == 200
        assert response.data["success"] is True

    def test_create_salary_slip(self, auth_client, sample_employee):
        data = {
            "employee": sample_employee.id,
            "total_amount": 7500.0,
            "transaction_no": "Tr67890"
        }
        response = auth_client.post(self.url, data)
        assert response.status_code == 201
        assert response.data["success"] is True

@pytest.mark.django_db
class TestSalarySlipDetailAPIView:
    def setup_method(self):
        self.sample_employee = Employee.objects.create_user(
            first_name="Slip",
            last_name="Employee",
            phone_no="5555555555",
            monthly_salary=5000,
            password="slippass"
        )
        self.sample_slip = SalarySlip.objects.create(
            employee=self.sample_employee,
            total_amount=5000.0,
            transaction_no="Tr54321"
        )
        self.url = f"/api/v1/hr/auth/salary-slips/{self.sample_slip.id}/"

    def test_get_salary_slip_detail(self, auth_client):
        response = auth_client.get(self.url)
        assert response.status_code == 200
        assert response.data["success"] is True

    def test_update_salary_slip(self, auth_client):
        data = {"total_amount": 5500.0}
        response = auth_client.patch(self.url, data)
        assert response.status_code == 200
        assert response.data["success"] is True

    def test_delete_salary_slip(self, auth_client):
        response = auth_client.delete(self.url)
        assert response.status_code == 204
        assert response.data["success"] is True

@pytest.mark.django_db
class TestSalarySlipBreakdownListAPIView:
    def setup_method(self):
        self.url = "/api/v1/hr/auth/salary-breakdowns/"

    def test_list_breakdowns(self, auth_client, sample_salary_slip):
        SalarySlipBreakdown.objects.create(
            salary_slip=sample_salary_slip,
            name="Basic Pay",
            amount=7000.0,
            type_pay=1
        )
        response = auth_client.get(self.url)
        assert response.status_code == 200
        assert response.data["success"] is True

    def test_create_breakdown(self, auth_client, sample_salary_slip):
        data = {
            "salary_slip": sample_salary_slip.id,
            "name": "HRA",
            "amount": 1000.0,
            "type_pay": 1
        }
        response = auth_client.post(self.url, data)
        assert response.status_code == 201
        assert response.data["success"] is True

@pytest.mark.django_db
class TestSalarySlipBreakdownDetailAPIView:
    def setup_method(self):
        self.sample_employee = Employee.objects.create_user(
            first_name="Breakdown",
            last_name="Employee",
            phone_no="4444444444",
            monthly_salary=4000,
            password="breakpass"
        )
        self.sample_slip = SalarySlip.objects.create(
            employee=self.sample_employee,
            total_amount=4000.0,
            transaction_no="Tr44444"
        )
        self.sample_breakdown = SalarySlipBreakdown.objects.create(
            salary_slip=self.sample_slip,
            name="Conveyance",
            amount=500.0,
            type_pay=1
        )
        self.url = f"/api/v1/hr/auth/salary-breakdowns/{self.sample_breakdown.id}/"

    def test_get_breakdown_detail(self, auth_client):
        response = auth_client.get(self.url)
        assert response.status_code == 200
        assert response.data["success"] is True

    def test_update_breakdown(self, auth_client):
        data = {"amount": 600.0}
        response = auth_client.patch(self.url, data)
        assert response.status_code == 200
        assert response.data["success"] is True

    def test_delete_breakdown(self, auth_client):
        response = auth_client.delete(self.url)
        assert response.status_code == 204
        assert response.data["success"] is True

@pytest.mark.django_db
class TestShiftListCreateAPIView:
    def setup_method(self):
        self.url = "/api/v1/hr/auth/shifts/"

    def test_list_shifts(self, auth_client, sample_shift):
        response = auth_client.get(self.url)
        assert response.status_code == 200
        assert response.data["success"] is True

    def test_create_shift(self, auth_client, sample_employee):
        data = {
            "employee": sample_employee.id,
            "start_time": "08:00:00",
            "end_time": "16:00:00"
        }
        response = auth_client.post(self.url, data)
        assert response.status_code == 201
        assert response.data["success"] is True

@pytest.mark.django_db
class TestShiftDetailAPIView:
    def setup_method(self):
        self.sample_employee = Employee.objects.create_user(
            first_name="Shift",
            last_name="Employee",
            phone_no="3333333333",
            monthly_salary=3000,
            password="shiftpass"
        )
        self.sample_shift = Shifts.objects.create(
            employee=self.sample_employee,
            start_time=time(10, 0),
            end_time=time(18, 0)
        )
        self.url = f"/api/v1/hr/auth/shifts/{self.sample_shift.id}/"

    def test_get_shift_detail(self, auth_client):
        response = auth_client.get(self.url)
        assert response.status_code == 200
        assert response.data["success"] is True

    def test_update_shift(self, auth_client):
        data = {"start_time": "09:00:00"}
        response = auth_client.patch(self.url, data)
        assert response.status_code == 200
        assert response.data["success"] is True

    def test_delete_shift(self, auth_client):
        response = auth_client.delete(self.url)
        assert response.status_code == 204
        assert response.data["success"] is True

@pytest.mark.django_db
class TestAttendanceLogListCreateAPIView:
    def setup_method(self):
        self.url = "/api/v1/hr/auth/attendance-logs/"

    def test_list_attendance_logs(self, auth_client, sample_shift):
        AttendanceLog.objects.create(
            shift=sample_shift,
            entry_time=datetime.now(),
            exit_time=datetime.now() + timedelta(hours=8)
        )
        response = auth_client.get(self.url)
        assert response.status_code == 200
        assert response.data["success"] is True

    def test_create_attendance_log(self, auth_client, sample_shift):
        data = {
            "shift": sample_shift.id,
            "entry_time": datetime.now().isoformat(),
            "exit_time": (datetime.now() + timedelta(hours=8)).isoformat()
        }
        response = auth_client.post(self.url, data)
        assert response.status_code == 201
        assert response.data["success"] is True

@pytest.mark.django_db
class TestAttendanceLogDetailAPIView:
    def setup_method(self):
        self.sample_employee = Employee.objects.create_user(
            first_name="Attendance",
            last_name="Employee",
            phone_no="2222222222",
            monthly_salary=2000,
            password="attpass"
        )
        self.sample_shift = Shifts.objects.create(
            employee=self.sample_employee,
            start_time=time(9, 0),
            end_time=time(17, 0)
        )
        self.sample_log = AttendanceLog.objects.create(
            shift=self.sample_shift,
            entry_time=datetime.now(),
            exit_time=datetime.now() + timedelta(hours=8)
        )
        self.url = f"/api/v1/hr/auth/attendance-logs/{self.sample_log.id}/"

    def test_get_attendance_log_detail(self, auth_client):
        response = auth_client.get(self.url)
        assert response.status_code == 200
        assert response.data["success"] is True

    def test_update_attendance_log(self, auth_client):
        new_exit = datetime.now() + timedelta(hours=9)
        data = {"exit_time": new_exit.isoformat()}
        response = auth_client.patch(self.url, data)
        assert response.status_code == 200
        assert response.data["success"] is True

    def test_delete_attendance_log(self, auth_client):
        response = auth_client.delete(self.url)
        assert response.status_code == 204
        assert response.data["success"] is True