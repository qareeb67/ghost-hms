--
-- PostgreSQL database dump
--

\restrict cEMscuF3x27kZ1ogMsEaJ1F294TgwhB7FFaMyg3DJWltEdVx8MGtuNsdIHZNEYn

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: generate_doctor_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_doctor_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.doctor_number IS NULL
       OR NEW.doctor_number = '' THEN

        NEW.doctor_number :=
            'DOC-' ||
            LPAD(
                nextval(
                    'doctors_doctor_number_seq'
                )::TEXT,
                5,
                '0'
            );

    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_doctor_number() OWNER TO postgres;

--
-- Name: generate_patient_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_patient_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.patient_number IS NULL OR BTRIM(NEW.patient_number) = '' THEN
        NEW.patient_number :=
            'GHS-' ||
            TO_CHAR(CURRENT_DATE, 'YYYY') ||
            '-' ||
            LPAD(NEW.patient_id::TEXT, 6, '0');
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_patient_number() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    appointment_id integer NOT NULL,
    patient_id integer NOT NULL,
    doctor_id integer NOT NULL,
    appointment_date date NOT NULL,
    appointment_time time without time zone NOT NULL,
    reason text,
    status character varying(30) DEFAULT 'Scheduled'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT appointments_status_check CHECK (((status)::text = ANY ((ARRAY['Scheduled'::character varying, 'Confirmed'::character varying, 'Completed'::character varying, 'Cancelled'::character varying, 'No Show'::character varying])::text[])))
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- Name: appointments_appointment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointments_appointment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_appointment_id_seq OWNER TO postgres;

--
-- Name: appointments_appointment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointments_appointment_id_seq OWNED BY public.appointments.appointment_id;


--
-- Name: billing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.billing (
    bill_id integer NOT NULL,
    patient_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    service character varying(100) NOT NULL,
    payment_status character varying(30) DEFAULT 'Pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT billing_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['Pending'::character varying, 'Partially Paid'::character varying, 'Paid'::character varying])::text[])))
);


ALTER TABLE public.billing OWNER TO postgres;

--
-- Name: billing_bill_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.billing_bill_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.billing_bill_id_seq OWNER TO postgres;

--
-- Name: billing_bill_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.billing_bill_id_seq OWNED BY public.billing.bill_id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    department_id integer NOT NULL,
    department_name character varying(100) NOT NULL,
    department_code character varying(20) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_department_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_department_id_seq OWNER TO postgres;

--
-- Name: departments_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;


--
-- Name: doctor_qualifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_qualifications (
    qualification_id integer NOT NULL,
    doctor_id integer NOT NULL,
    qualification character varying(150) NOT NULL,
    institution character varying(200),
    year_obtained integer,
    certificate_number character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT doctor_qualification_year_valid CHECK (((year_obtained IS NULL) OR ((year_obtained >= 1900) AND ((year_obtained)::numeric <= EXTRACT(year FROM CURRENT_DATE)))))
);


ALTER TABLE public.doctor_qualifications OWNER TO postgres;

--
-- Name: doctor_qualifications_qualification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctor_qualifications_qualification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_qualifications_qualification_id_seq OWNER TO postgres;

--
-- Name: doctor_qualifications_qualification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctor_qualifications_qualification_id_seq OWNED BY public.doctor_qualifications.qualification_id;


--
-- Name: doctors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctors (
    doctor_id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    specialization character varying(100) NOT NULL,
    phone character varying(20),
    email character varying(100),
    years_of_experience integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer,
    doctor_number character varying(20) NOT NULL,
    middle_name character varying(100),
    gender character varying(20),
    qualification character varying(255),
    mdcn_number character varying(50),
    mdcn_status character varying(30),
    employment_type character varying(30),
    department character varying(100),
    license_expiry_date date,
    address text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    department_id integer,
    specialization_id integer,
    employment_start_date date,
    employment_end_date date,
    employment_status character varying(30),
    emergency_contact_name character varying(150),
    emergency_contact_phone character varying(20),
    emergency_contact_relationship character varying(50),
    professional_role character varying(50),
    CONSTRAINT doctors_employment_dates_valid CHECK (((employment_end_date IS NULL) OR (employment_start_date IS NULL) OR (employment_end_date >= employment_start_date))),
    CONSTRAINT doctors_employment_status_valid CHECK (((employment_status IS NULL) OR ((employment_status)::text = ANY ((ARRAY['Active'::character varying, 'On Leave'::character varying, 'Suspended'::character varying, 'Inactive'::character varying, 'Resigned'::character varying, 'Terminated'::character varying, 'Retired'::character varying])::text[])))),
    CONSTRAINT doctors_employment_type_valid CHECK (((employment_type IS NULL) OR ((employment_type)::text = ANY ((ARRAY['Full-time'::character varying, 'Part-time'::character varying, 'Contract'::character varying, 'Locum'::character varying, 'Consultant'::character varying])::text[])))),
    CONSTRAINT doctors_mdcn_status_valid CHECK (((mdcn_status IS NULL) OR ((mdcn_status)::text = ANY ((ARRAY['Pending Verification'::character varying, 'Active'::character varying, 'Expired'::character varying, 'Suspended'::character varying, 'Inactive'::character varying])::text[])))),
    CONSTRAINT doctors_professional_role_valid CHECK (((professional_role IS NULL) OR ((professional_role)::text = ANY ((ARRAY['Consultant'::character varying, 'Senior Registrar'::character varying, 'Registrar'::character varying, 'Medical Officer'::character varying, 'House Officer'::character varying, 'Intern'::character varying, 'Locum Doctor'::character varying, 'Other'::character varying])::text[])))),
    CONSTRAINT doctors_years_experience_non_negative CHECK (((years_of_experience IS NULL) OR (years_of_experience >= 0)))
);


ALTER TABLE public.doctors OWNER TO postgres;

--
-- Name: doctors_doctor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctors_doctor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctors_doctor_id_seq OWNER TO postgres;

--
-- Name: doctors_doctor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctors_doctor_id_seq OWNED BY public.doctors.doctor_id;


--
-- Name: doctors_doctor_number_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctors_doctor_number_seq
    START WITH 10
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctors_doctor_number_seq OWNER TO postgres;

--
-- Name: emergency_cases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.emergency_cases (
    emergency_id integer NOT NULL,
    patient_id integer,
    temporary_name character varying(100),
    triage_level character varying(20) NOT NULL,
    assigned_doctor integer,
    status character varying(30) DEFAULT 'Waiting'::character varying,
    emergency_notes text,
    arrival_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT emergency_cases_status_check CHECK (((status)::text = ANY ((ARRAY['Waiting'::character varying, 'In Treatment'::character varying, 'Completed'::character varying])::text[]))),
    CONSTRAINT emergency_cases_triage_level_check CHECK (((triage_level)::text = ANY ((ARRAY['Critical'::character varying, 'High'::character varying, 'Medium'::character varying, 'Low'::character varying])::text[])))
);


ALTER TABLE public.emergency_cases OWNER TO postgres;

--
-- Name: emergency_cases_emergency_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.emergency_cases_emergency_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.emergency_cases_emergency_id_seq OWNER TO postgres;

--
-- Name: emergency_cases_emergency_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.emergency_cases_emergency_id_seq OWNED BY public.emergency_cases.emergency_id;


--
-- Name: laboratory_tests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.laboratory_tests (
    test_id integer NOT NULL,
    patient_id integer NOT NULL,
    doctor_id integer NOT NULL,
    test_name character varying(100) NOT NULL,
    status character varying(30) DEFAULT 'Pending'::character varying,
    result text,
    requested_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone
);


ALTER TABLE public.laboratory_tests OWNER TO postgres;

--
-- Name: laboratory_tests_test_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.laboratory_tests_test_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.laboratory_tests_test_id_seq OWNER TO postgres;

--
-- Name: laboratory_tests_test_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.laboratory_tests_test_id_seq OWNED BY public.laboratory_tests.test_id;


--
-- Name: medical_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_records (
    record_id integer NOT NULL,
    patient_id integer NOT NULL,
    doctor_id integer NOT NULL,
    diagnosis text NOT NULL,
    prescription text,
    allergies text,
    notes text,
    visit_date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    chief_complaint text,
    symptoms text,
    history_of_present_illness text,
    blood_pressure character varying(20),
    temperature numeric(4,1),
    pulse_rate integer,
    respiratory_rate integer,
    oxygen_saturation numeric(5,2),
    weight numeric(6,2),
    height numeric(6,2),
    treatment_plan text,
    investigation_notes text,
    follow_up_date date,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.medical_records OWNER TO postgres;

--
-- Name: medical_records_record_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_records_record_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_records_record_id_seq OWNER TO postgres;

--
-- Name: medical_records_record_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medical_records_record_id_seq OWNED BY public.medical_records.record_id;


--
-- Name: medicines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicines (
    medicine_id integer NOT NULL,
    medicine_name character varying(100) NOT NULL,
    category character varying(100),
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    expiry_date date,
    manufacturer character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.medicines OWNER TO postgres;

--
-- Name: medicines_medicine_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medicines_medicine_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medicines_medicine_id_seq OWNER TO postgres;

--
-- Name: medicines_medicine_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medicines_medicine_id_seq OWNED BY public.medicines.medicine_id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    notification_id integer NOT NULL,
    user_id integer,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_notification_id_seq OWNER TO postgres;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    patient_id integer NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    gender character varying(10),
    phone character varying(20),
    address text,
    date_of_birth date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    email character varying(255),
    blood_group character varying(10),
    genotype character varying(10),
    marital_status character varying(30),
    occupation character varying(100),
    emergency_contact_name character varying(255),
    emergency_contact_phone character varying(30),
    emergency_contact_relationship character varying(50),
    allergies text,
    medical_history text,
    patient_number character varying(30) NOT NULL,
    patient_status character varying(20) DEFAULT 'Active'::character varying NOT NULL,
    nationality character varying(100),
    state_of_origin character varying(100),
    lga character varying(100),
    registration_date date DEFAULT CURRENT_DATE NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status character varying(20) DEFAULT 'Active'::character varying,
    CONSTRAINT patients_patient_status_check CHECK (((patient_status)::text = ANY ((ARRAY['Active'::character varying, 'Inactive'::character varying, 'Transferred'::character varying, 'Deceased'::character varying, 'Archived'::character varying])::text[])))
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: patients_patient_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patients_patient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patients_patient_id_seq OWNER TO postgres;

--
-- Name: patients_patient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patients_patient_id_seq OWNED BY public.patients.patient_id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    payment_id integer NOT NULL,
    bill_id integer NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_method character varying(50) NOT NULL,
    transaction_reference character varying(100),
    received_by integer,
    payment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payment_amount_positive CHECK ((amount > (0)::numeric)),
    CONSTRAINT payment_method_valid CHECK (((payment_method)::text = ANY ((ARRAY['Cash'::character varying, 'Card'::character varying, 'Transfer'::character varying, 'Insurance'::character varying])::text[])))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_payment_id_seq OWNER TO postgres;

--
-- Name: payments_payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_payment_id_seq OWNED BY public.payments.payment_id;


--
-- Name: prescription_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescription_items (
    prescription_item_id integer NOT NULL,
    prescription_id integer NOT NULL,
    medicine_id integer NOT NULL,
    medicine_name character varying(100) NOT NULL,
    strength character varying(100),
    dosage character varying(100),
    frequency character varying(100),
    duration character varying(100),
    route character varying(50),
    instructions text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.prescription_items OWNER TO postgres;

--
-- Name: prescription_items_prescription_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prescription_items_prescription_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescription_items_prescription_item_id_seq OWNER TO postgres;

--
-- Name: prescription_items_prescription_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prescription_items_prescription_item_id_seq OWNED BY public.prescription_items.prescription_item_id;


--
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescriptions (
    prescription_id integer NOT NULL,
    record_id integer NOT NULL,
    patient_id integer NOT NULL,
    doctor_id integer NOT NULL,
    prescription_date date DEFAULT CURRENT_DATE NOT NULL,
    notes text,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT prescriptions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'dispensed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.prescriptions OWNER TO postgres;

--
-- Name: prescriptions_prescription_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prescriptions_prescription_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescriptions_prescription_id_seq OWNER TO postgres;

--
-- Name: prescriptions_prescription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prescriptions_prescription_id_seq OWNED BY public.prescriptions.prescription_id;


--
-- Name: specializations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.specializations (
    specialization_id integer NOT NULL,
    specialization_name character varying(100) NOT NULL,
    specialization_code character varying(20) NOT NULL,
    description text,
    department_id integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.specializations OWNER TO postgres;

--
-- Name: specializations_specialization_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.specializations_specialization_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.specializations_specialization_id_seq OWNER TO postgres;

--
-- Name: specializations_specialization_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.specializations_specialization_id_seq OWNED BY public.specializations.specialization_id;


--
-- Name: sync_queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sync_queue (
    sync_id integer NOT NULL,
    table_name character varying(100) NOT NULL,
    record_id integer NOT NULL,
    operation character varying(20) NOT NULL,
    sync_status character varying(20) DEFAULT 'Pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    synced_at timestamp without time zone
);


ALTER TABLE public.sync_queue OWNER TO postgres;

--
-- Name: sync_queue_sync_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sync_queue_sync_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sync_queue_sync_id_seq OWNER TO postgres;

--
-- Name: sync_queue_sync_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sync_queue_sync_id_seq OWNED BY public.sync_queue.sync_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'staff'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: appointments appointment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments ALTER COLUMN appointment_id SET DEFAULT nextval('public.appointments_appointment_id_seq'::regclass);


--
-- Name: billing bill_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing ALTER COLUMN bill_id SET DEFAULT nextval('public.billing_bill_id_seq'::regclass);


--
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- Name: doctor_qualifications qualification_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_qualifications ALTER COLUMN qualification_id SET DEFAULT nextval('public.doctor_qualifications_qualification_id_seq'::regclass);


--
-- Name: doctors doctor_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors ALTER COLUMN doctor_id SET DEFAULT nextval('public.doctors_doctor_id_seq'::regclass);


--
-- Name: emergency_cases emergency_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emergency_cases ALTER COLUMN emergency_id SET DEFAULT nextval('public.emergency_cases_emergency_id_seq'::regclass);


--
-- Name: laboratory_tests test_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laboratory_tests ALTER COLUMN test_id SET DEFAULT nextval('public.laboratory_tests_test_id_seq'::regclass);


--
-- Name: medical_records record_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records ALTER COLUMN record_id SET DEFAULT nextval('public.medical_records_record_id_seq'::regclass);


--
-- Name: medicines medicine_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines ALTER COLUMN medicine_id SET DEFAULT nextval('public.medicines_medicine_id_seq'::regclass);


--
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- Name: patients patient_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients ALTER COLUMN patient_id SET DEFAULT nextval('public.patients_patient_id_seq'::regclass);


--
-- Name: payments payment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN payment_id SET DEFAULT nextval('public.payments_payment_id_seq'::regclass);


--
-- Name: prescription_items prescription_item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items ALTER COLUMN prescription_item_id SET DEFAULT nextval('public.prescription_items_prescription_item_id_seq'::regclass);


--
-- Name: prescriptions prescription_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions ALTER COLUMN prescription_id SET DEFAULT nextval('public.prescriptions_prescription_id_seq'::regclass);


--
-- Name: specializations specialization_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specializations ALTER COLUMN specialization_id SET DEFAULT nextval('public.specializations_specialization_id_seq'::regclass);


--
-- Name: sync_queue sync_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sync_queue ALTER COLUMN sync_id SET DEFAULT nextval('public.sync_queue_sync_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (appointment_id);


--
-- Name: billing billing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing
    ADD CONSTRAINT billing_pkey PRIMARY KEY (bill_id);


--
-- Name: departments departments_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_code_unique UNIQUE (department_code);


--
-- Name: departments departments_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_unique UNIQUE (department_name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- Name: doctor_qualifications doctor_qualifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_qualifications
    ADD CONSTRAINT doctor_qualifications_pkey PRIMARY KEY (qualification_id);


--
-- Name: doctors doctors_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_email_key UNIQUE (email);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (doctor_id);


--
-- Name: emergency_cases emergency_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emergency_cases
    ADD CONSTRAINT emergency_cases_pkey PRIMARY KEY (emergency_id);


--
-- Name: laboratory_tests laboratory_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laboratory_tests
    ADD CONSTRAINT laboratory_tests_pkey PRIMARY KEY (test_id);


--
-- Name: medical_records medical_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_pkey PRIMARY KEY (record_id);


--
-- Name: medicines medicines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT medicines_pkey PRIMARY KEY (medicine_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: patients patients_patient_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_patient_number_unique UNIQUE (patient_number);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (patient_id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (payment_id);


--
-- Name: prescription_items prescription_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_pkey PRIMARY KEY (prescription_item_id);


--
-- Name: prescriptions prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (prescription_id);


--
-- Name: specializations specializations_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specializations
    ADD CONSTRAINT specializations_code_unique UNIQUE (specialization_code);


--
-- Name: specializations specializations_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specializations
    ADD CONSTRAINT specializations_name_unique UNIQUE (specialization_name);


--
-- Name: specializations specializations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specializations
    ADD CONSTRAINT specializations_pkey PRIMARY KEY (specialization_id);


--
-- Name: sync_queue sync_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sync_queue
    ADD CONSTRAINT sync_queue_pkey PRIMARY KEY (sync_id);


--
-- Name: appointments unique_doctor_appointment; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT unique_doctor_appointment UNIQUE (doctor_id, appointment_date, appointment_time);


--
-- Name: doctors unique_doctor_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT unique_doctor_user UNIQUE (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: doctors_doctor_number_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX doctors_doctor_number_unique ON public.doctors USING btree (doctor_number) WHERE (doctor_number IS NOT NULL);


--
-- Name: doctors_mdcn_number_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX doctors_mdcn_number_unique ON public.doctors USING btree (mdcn_number) WHERE (mdcn_number IS NOT NULL);


--
-- Name: idx_appointments_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_date ON public.appointments USING btree (appointment_date);


--
-- Name: idx_appointments_doctor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_doctor_id ON public.appointments USING btree (doctor_id);


--
-- Name: idx_appointments_patient_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_patient_id ON public.appointments USING btree (patient_id);


--
-- Name: idx_billing_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_billing_created_at ON public.billing USING btree (created_at);


--
-- Name: idx_billing_patient_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_billing_patient_id ON public.billing USING btree (patient_id);


--
-- Name: idx_billing_payment_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_billing_payment_status ON public.billing USING btree (payment_status);


--
-- Name: idx_doctor_qualifications_doctor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctor_qualifications_doctor_id ON public.doctor_qualifications USING btree (doctor_id);


--
-- Name: idx_emergency_cases_arrival_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_emergency_cases_arrival_time ON public.emergency_cases USING btree (arrival_time);


--
-- Name: idx_emergency_cases_doctor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_emergency_cases_doctor ON public.emergency_cases USING btree (assigned_doctor);


--
-- Name: idx_emergency_cases_patient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_emergency_cases_patient ON public.emergency_cases USING btree (patient_id);


--
-- Name: idx_emergency_cases_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_emergency_cases_status ON public.emergency_cases USING btree (status);


--
-- Name: idx_emergency_cases_triage; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_emergency_cases_triage ON public.emergency_cases USING btree (triage_level);


--
-- Name: idx_patients_last_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patients_last_name ON public.patients USING btree (last_name);


--
-- Name: idx_patients_patient_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patients_patient_number ON public.patients USING btree (patient_number);


--
-- Name: idx_patients_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patients_phone ON public.patients USING btree (phone);


--
-- Name: idx_patients_state_lga; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patients_state_lga ON public.patients USING btree (state_of_origin, lga);


--
-- Name: idx_patients_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patients_status ON public.patients USING btree (patient_status);


--
-- Name: idx_payments_bill_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_bill_id ON public.payments USING btree (bill_id);


--
-- Name: idx_payments_payment_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_payment_date ON public.payments USING btree (payment_date);


--
-- Name: idx_payments_received_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_received_by ON public.payments USING btree (received_by);


--
-- Name: doctors generate_doctor_number_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER generate_doctor_number_trigger BEFORE INSERT ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.generate_doctor_number();


--
-- Name: patients trg_generate_patient_number; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_generate_patient_number BEFORE INSERT ON public.patients FOR EACH ROW EXECUTE FUNCTION public.generate_patient_number();


--
-- Name: billing billing_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing
    ADD CONSTRAINT billing_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: billing billing_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing
    ADD CONSTRAINT billing_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE RESTRICT;


--
-- Name: emergency_cases emergency_cases_assigned_doctor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emergency_cases
    ADD CONSTRAINT emergency_cases_assigned_doctor_fkey FOREIGN KEY (assigned_doctor) REFERENCES public.doctors(doctor_id);


--
-- Name: emergency_cases emergency_cases_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emergency_cases
    ADD CONSTRAINT emergency_cases_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- Name: appointments fk_appointment_doctor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctor_id) ON DELETE CASCADE;


--
-- Name: appointments fk_appointment_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;


--
-- Name: appointments fk_doctor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctor_id) ON DELETE CASCADE;


--
-- Name: medical_records fk_doctor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT fk_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctor_id) ON DELETE CASCADE;


--
-- Name: doctors fk_doctor_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT fk_doctor_department FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: doctor_qualifications fk_doctor_qualification_doctor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_qualifications
    ADD CONSTRAINT fk_doctor_qualification_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctor_id) ON DELETE CASCADE;


--
-- Name: doctors fk_doctor_specialization; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT fk_doctor_specialization FOREIGN KEY (specialization_id) REFERENCES public.specializations(specialization_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: doctors fk_doctor_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: appointments fk_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;


--
-- Name: medical_records fk_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;


--
-- Name: payments fk_payment_bill; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_payment_bill FOREIGN KEY (bill_id) REFERENCES public.billing(bill_id) ON DELETE RESTRICT;


--
-- Name: prescriptions fk_prescription_doctor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT fk_prescription_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctor_id);


--
-- Name: prescription_items fk_prescription_item_medicine; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT fk_prescription_item_medicine FOREIGN KEY (medicine_id) REFERENCES public.medicines(medicine_id);


--
-- Name: prescription_items fk_prescription_item_prescription; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT fk_prescription_item_prescription FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(prescription_id) ON DELETE CASCADE;


--
-- Name: prescriptions fk_prescription_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT fk_prescription_patient FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- Name: prescriptions fk_prescription_record; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT fk_prescription_record FOREIGN KEY (record_id) REFERENCES public.medical_records(record_id) ON DELETE CASCADE;


--
-- Name: specializations fk_specialization_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specializations
    ADD CONSTRAINT fk_specialization_department FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: laboratory_tests laboratory_tests_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laboratory_tests
    ADD CONSTRAINT laboratory_tests_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctor_id);


--
-- Name: laboratory_tests laboratory_tests_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laboratory_tests
    ADD CONSTRAINT laboratory_tests_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict cEMscuF3x27kZ1ogMsEaJ1F294TgwhB7FFaMyg3DJWltEdVx8MGtuNsdIHZNEYn

