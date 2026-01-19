# Free Tech Services for Small Businesses

A web application that helps small businesses scale using AI and technology solutions.

## Features

- **Landing Page**: Modern, responsive website showcasing services
- **Lead Collection**: Form to capture businesses' scaling challenges
- **Admin Dashboard**: View and manage form submissions
- **Email Integration**: Send Calendly invitations to prospects
- **Calendly Widget**: Direct scheduling option for visitors

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: SQLite
- **Email**: Nodemailer

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/free-tech-services.git
cd free-tech-services
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CALENDLY_LINK=https://calendly.com/your-link
```

4. Start the server
```bash
npm start
```

5. Access the application
- Main site: http://localhost:3001
- Admin panel: http://localhost:3001/admin

## Email Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate an app password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use the app password in your `.env` file

## License

This project is open source and available under the MIT License.
