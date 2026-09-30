# AthleteX Testing Summary Report

## 1. Overview
This document provides a comprehensive summary of all automated testing implemented and executed for the AthleteX project. The testing suite covers backend business logic, REST API endpoints, end-to-end browser UI flows using Selenium, and frontend component unit testing.

* Total Tests Executed: 23
* Total Passed: 23
* Total Failed: 0
* Pass Rate: 100%
* Overall Build Status: Success

---

## 2. Backend Testing

### 2.1 Technologies Used
* Framework: Spring Boot Test, JUnit 5, Mockito, Spring MockMvc
* Scope: Service unit testing, repository mocking, REST endpoint controller testing

### 2.2 Test Classes and Scenarios

#### Class: AuthServiceTest
* register_Success: Verifies new user registration, password encoding, and database save operations.
* register_DuplicateEmail: Verifies rejection when registering with an already existing email address.
* register_WeakPassword: Enforces password validation rules (minimum 8 characters, uppercase letter, digit, special character).
* login_Success: Verifies credential validation, activity logging, and JWT token generation.
* login_UserNotFound: Verifies exception handling when an invalid email is submitted.
* login_InvalidPassword: Verifies rejection of incorrect passwords.

#### Class: BadgeServiceTest
* evaluateAthleteBadges_NoAchievements: Ensures all badges remain locked when 0 achievements exist.
* evaluateAthleteBadges_OneAchievement: Verifies unlocking of the "First Step Trophy" badge upon logging 1 achievement.
* evaluateAthleteBadges_GoldAndVerified: Verifies unlocking of "Gold Standard", "Coach Verified Champion", and "Verified Media Proof" badges.

#### Class: CoachReportServiceTest
* getIndividualAthleteReport_Success: Verifies generation of individual athlete performance metrics (overall score, speed, strength, endurance, agility) and trend points.
* getIndividualAthleteReport_UnassignedAccessDenied: Enforces security isolation so coaches cannot access data of unassigned athletes.

#### Class: AuthControllerTest
* POST /api/auth/register: Verifies HTTP 200 response and string confirmation upon valid registration payload.
* POST /api/auth/login: Verifies HTTP 200 response returning LoginResponse DTO containing JWT token and user role.

#### Class: NotificationControllerTest
* GET /api/notifications: Verifies fetching notifications for a specific user ID.
* GET /api/notifications/unread-count: Verifies returning unread notification count.
* PUT /api/notifications/{id}/read: Verifies updating notification status to read.

---

## 3. End-to-End (E2E) Browser Testing (Selenium)

### 3.1 Technologies Used
* Framework: Selenium WebDriver 4, WebDriverManager, Headless Chrome Browser
* Target URL: http://localhost:5173

### 3.2 Test Class: AthleteXWebE2ETest

* setupClass: Automatically downloads matching ChromeDriver binary (Chrome 153) and initializes headless browser options.
* testHomepageLoads: Navigates to http://localhost:5173, verifies page title, and waits for the React DOM root container (#root) to mount.
* testLoginPageControls: Navigates to http://localhost:5173/login, waits for body container, and asserts presence of sign-in form elements and branding.
* teardownClass: Safely terminates the browser process after execution.

---

## 4. Frontend Component Testing

### 4.1 Technologies Used
* Framework: Vitest, React Testing Library, jsdom
* Environment: Node.js, React SPA

### 4.2 Test Classes and Scenarios

#### Class: ProtectedRoute.test.jsx
* redirects unauthenticated user to /login: Verifies unauthenticated users are redirected to the login route when accessing protected URLs.
* renders children when user is logged in with matching role: Verifies rendering of child components when valid user session exists.
* redirects to role dashboard when user role does not match requiredRole: Verifies role-based route protection (e.g., Athlete attempting to open Admin routes is redirected).

#### Class: Login.test.jsx
* renders sign-in header and input fields correctly: Verifies full name/email input field, password field, and submit button exist.
* handles user input and updates state: Verifies form input value changes update local state correctly.

---

## 5. Execution Summary Table

| Category | Framework / Tools | Test File Name | Executed | Passed | Failed |
| --- | --- | --- | --- | --- | --- |
| Backend Unit | JUnit 5, Mockito | AuthServiceTest | 6 | 6 | 0 |
| Backend Unit | JUnit 5, Mockito | BadgeServiceTest | 3 | 3 | 0 |
| Backend Unit | JUnit 5, Mockito | CoachReportServiceTest | 2 | 2 | 0 |
| REST Controller | Spring MockMvc | AuthControllerTest | 2 | 2 | 0 |
| REST Controller | Spring MockMvc | NotificationControllerTest | 3 | 3 | 0 |
| Selenium E2E | Selenium 4, Chrome | AthleteXWebE2ETest | 2 | 2 | 0 |
| Frontend Component | Vitest, React Testing Library | ProtectedRoute.test.jsx | 3 | 3 | 0 |
| Frontend Component | Vitest, React Testing Library | Login.test.jsx | 2 | 2 | 0 |
| Total | | | 23 | 23 | 0 |

---

## 6. Execution Commands

### Run Backend Unit & Controller Tests
cd athletex-backend
.\mvnw.cmd test "-Dtest=AuthServiceTest,BadgeServiceTest,CoachReportServiceTest,NotificationControllerTest,AuthControllerTest"

### Run Selenium E2E Tests
cd athletex-backend
.\mvnw.cmd test "-Dtest=AthleteXWebE2ETest"

### Run Frontend Vitest Suite
cd athletex-frontend
npm test
