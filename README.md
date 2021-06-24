# Capstone-2

# Substitute Chef

## Overview

- Allows a restaurant worker to connect with companies and schedule a shift of work
- Targeted toward restaurant workers who need assistance finding work and restaurants in need of workers
- Once logged in, workers create a profile to search for open jobs
- Workers will be able to view companies and see their location on Google Maps
- Site will be created with restaurants in San Diego

## Schema 

- Table for user containing username, password, first name, last name, and email
- Table for company containing id, name, url, address, latitude, longitude and username
- Table for job containing id, position, hourly pay, date and company id
- Table for application containing status, username and job id

## Potential API issues

- Error handling if API is down or doesn't return a 200 response code

## Functionality/User Flow

- Upon entering the webpage, a user can choose to sign up or login as a user
- Once logged in as a user, user will be able to view/edit user information
- A user can also search for jobs with an accompanying interactive google map
- There will be a button for a user to apply directly to a job
- After applying, a user can view a page of job applications
- A user can choose to register a company
- A user can create a listing for a job which includes position, hourly pay, and date
- There will be a profile page where a company can edit its data and a page with open applications where a company can approve or deny an application

## Data
- Google Maps API will be used to search for locations
- SendGrid will be used to send emails 

## Technology Stack
- Application will be built using Javascript, React and Node

## Stretch Goals
- Restaurants can pay employees through the site
- Liability waver for both to sign
- Ratings for users and companies
- Add profile photo and company photo
