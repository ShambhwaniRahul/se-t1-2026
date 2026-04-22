# Implementation Details

## 1. Technologies and Tools Used
The **Coherence** platform is built using a modern, decoupled architecture (Headless ERP) to ensure scalability, security, and high performance. The technology stack is divided into distinct layers:

**Frontend (Client-Side Interface)**
* **Core Framework:** React.js (v18) built with Vite for optimized bundling and fast Hot Module Replacement (HMR).
* **Language:** TypeScript for static type-checking and robust interface definitions.
* **Styling & UI:** Tailwind CSS for utility-first, responsive design, combined with Shadcn UI for accessible, pre-built components.
* **State Management & Routing:** React Hooks (Context API) and React Router DOM.
* **Icons & Assets:** Lucide React for consistent, scalable vector iconography.

**Backend (Server & Business Logic)**
* **Core Framework:** Django (Python 3.11+) combined with Django REST Framework (DRF) to construct a robust API.
* **Authentication:** JSON Web Tokens (JWT) for secure, stateless Role-Based Access Control (RBAC).
* **Database:** PostgreSQL (deployed on NeonDB) for reliable relational data storage.
* **Testing:** Pytest for backend unit and integration testing.

**Artificial Intelligence & Microservices**
* **LLM Integration:** Google Gemini Pro API.
* **Invoice OCR Service:** A dedicated Python microservice leveraging Gemini and prompting to extract structured JSON data from physical vendor invoices (`Invoice_OCR`).
* **Marketing & Analytics Service:** A standalone AI service (`Email_Marketing`) to generate smart forecasts and automated campaigns.

**Version Control & Documentation**
* **Code Repository:** Git/GitHub.
* **API Documentation:** Swagger/OpenAPI specification (`Swagger.yaml`).

---

## 2. Instructions to Run the Application

The project is structured into separate directories for the backend API, the frontend client, and the AI microservices. Follow these steps to run the application locally.

### Prerequisites
* Python 3.11 or higher installed.
* Node.js (v18+) and npm installed.
* PostgreSQL installed (or a valid NeonDB connection string).

### Step 1: Backend Setup (Django API)
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your environment variables. Create a `.env` file in the `backend` folder and add your database credentials and secret keys.
5. Apply the database migrations to build the schema:
   ```bash
   python manage.py migrate
   ```
6. **(Optional but Recommended)** Populate the database with mock data using the custom simulation scripts built into the system:
   ```bash
   python manage.py simulate_table_creation
   python manage.py simulate_menu_creation
   python manage.py simulate_customer_creation
   ```
7. Start the backend development server:
   ```bash
   python manage.py runserver
   ```
   *The backend API will now be running at `http://127.0.0.1:8000/`.*

### Step 2: Frontend Setup (React/Vite Client)
1. Open a **new** terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the necessary Node.js dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` folder to point the client to the local Django API:
   ```env
   VITE_API_URL=http://127.0.0.1:8000/api/v1
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will now be running at `http://localhost:5173/`. Open this URL in your browser to access Coherence.*

### Step 3: AI Microservices Setup (OCR)
If you wish to test the AI capabilities (like scanning vendor invoices), you must run the microservices.
1. Open a new terminal and navigate to the desired service (e.g., `Invoice_OCR`):
   ```bash
   cd Invoice_OCR
   ```
2. Activate your virtual environment and install the specific microservice requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Ensure your `GEMINI_API_KEY` is configured in the `.env` file.
4. Execute the main script:
   ```bash
   python main.py
   ```
5. To test the OCR service upload a vendor invoice pdf in an open purchase order to mark as closed. Open Postman and login via https://se-t1-2026.onrender.com/auth/login. Copy the access key into bearer token and visit https://se-t1-2026.onrender.com/api/v1/procurement/purchase-orders/16 with request body containing the file test_invoice.webp under the "file" key as provided in Milestone 5 directory https://drive.google.com/drive/folders/1l4-Ob1FE7gXFTwrEA0hQwlHvBbEeL9B0 and "expected_skus_json" key as {
  "Sabudana": "KG",
  "Urad Dal": "KG",
  "Sabudana - Khichdi": "KG",
  "Oil": "Liters",
  "Oil Can": "Liters",
  "Sugar": "Pieces",
  "Milk": "Litres",
  "Curd": "KG",
  "Kidney Beans": "KG",
  "Biscuit": "Pieces",
  "Chickpea": "KG",
  "Chana Dal": "KG",
  "Masoor Dal": "KG",
  "Soya Chunks": "KG"
}
