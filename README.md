# Real Estate Lead Profiling and Management System Backend Task

> The goal is to design a lead profiling application for real estate rental and sale management. It should import, clean, and analyze lead data from multiple sources, helping agents and managers gain insights into lead preferences, engagement levels, and potential conversion probability.

## Lead Data Collection & import

The candidate should implement an API to import customer data from the provided JSON file:

- JSON file (representing offline data from multiple sources)
- Key lead data fields could include lead_id, name, contact, email, phone, property_type (rental or sale), budget, location, preferred_property_type (apartment, house, etc.), contact_date, and inquiry_notes.

### Lead Profiling & cleaning

- Validate and clean customer data (e.g., ensure email is valid, phone number format is standardized, age is within a reasonable range)

- Identify and manage duplicate records based on fields like email or phone number (where phone number is the unique parameter)

#### Validate and standardize data fields, such as

- Valid phone numbers and emails
- Standard budget format and preferred property type
- Identify duplicate leads using phone number

#### Profiling metrics should include

- Total number of leads
- Unique location count
- Average budget range per lead type (rental vs. sale) (🌟 Bonus Point)
- Average inquiry rate (frequency of leads by timeframe) (🌟 Bonus Point)

## API Endpoints

#### POST /analyze: Import and analyze provided lead data JSON and store the analyzed data in a JSON file

#### GET /lead/:leadPhoneNumber: Returns a detailed profile of a specific lead by phone number which should include all sale and rental lead data related to that phone number

#### (🌟 Bonus Point) GET /leadSummary: Provides a summary of lead profiling metrics like total leads, unique locations, etc