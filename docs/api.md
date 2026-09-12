# Hospital Management System API Documentation

## Base URL

Local development:

```text
http://localhost:5000
```

Production:

```text
https://<your-backend-domain>
```

---

# Authentication

Protected endpoints require a JWT token.

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

# Authentication Endpoints

| Method | Endpoint | Access |
|---------|----------|--------|
| POST | /users/login | Public |
| POST | /users/register | Admin |

---

# Patient Endpoints

| Method | Endpoint |
|---------|----------|
| GET | /patients |
| GET | /patients/:id |
| GET | /patients/search?q= |
| POST | /patients |
| PUT | /patients/:id |
| DELETE | /patients/:id |

---

# Doctor Endpoints

| Method | Endpoint |
|---------|----------|
| GET | /doctors |
| GET | /doctors/:id |
| POST | /doctors |
| PATCH | /doctors/:id |
| DELETE | /doctors/:id |

---

# Department Endpoints

| Method | Endpoint |
|---------|----------|
| GET | /departments |
| GET | /departments/active |
| GET | /departments/:id |

These endpoints require authentication.

---

# Appointment Endpoints

| Method | Endpoint |
|---------|----------|
| GET | /appointments |
| GET | /appointments/:id |
| POST | /appointments |
| PATCH | /appointments/:id |
| PATCH | /appointments/:id/complete |
| DELETE | /appointments/:id |

---

# Medical Record Endpoints

| Method | Endpoint |
|---------|----------|
| GET | /medical-records |
| GET | /medical-records/:id |
| POST | /medical-records |

---

# Emergency Endpoints

| Method | Endpoint |
|---------|----------|
| GET | /emergency |
| GET | /emergency/:id |
| POST | /emergency |

---

# Laboratory Endpoints

| Method | Endpoint |
|---------|----------|
| GET | /laboratory |
| GET | /laboratory/:id |
| POST | /laboratory |

---

# Medicine Endpoints

| Method | Endpoint |
|---------|----------|
| GET | /medicines |
| GET | /medicines/:id |
| POST | /medicines |

---

# Billing Endpoints

| Method | Endpoint |
|---------|----------|
| GET | /billing |
| GET | /billing/:id |
| POST | /billing |

---

# Payment Endpoints

| Method | Endpoint |
|---------|----------|
| GET | /payments |
| GET | /payments/:id |
| POST | /payments |

---

# Prescription Endpoints

| Method | Endpoint |
|---------|----------|
| GET | /prescriptions |
| GET | /prescriptions/:id |
| POST | /prescriptions |
| PATCH | /prescriptions/:id |

---

# Dashboard

| Method | Endpoint |
|---------|----------|
| GET | /dashboard |

---

# Offline Sync

| Method | Endpoint |
|---------|----------|
| GET | /sync |
| POST | /sync |
| PATCH | /sync/:id |

---

# Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
