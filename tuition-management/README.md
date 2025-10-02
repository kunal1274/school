# Tuition & Insurance Management System

A comprehensive web application built with Next.js for managing students, teachers, customers, transport, and fee collections for schools and coaching institutes.

## 🚀 Features

### Core Functionality
- **Multi-role Authentication**: Admin, Moderator, and Staff roles with role-based access control
- **Student Management**: Complete CRUD operations for student records
- **Teacher Management**: Manage teacher profiles and information
- **Customer Management**: Handle customer/guardian information
- **Transport Management**: Manage transport services and bookings
- **Fee Management**: Track and manage fee collections with multiple payment modes
- **WhatsApp Integration**: Manual WhatsApp reminder buttons for easy communication

### Technical Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Indian Flag Color Theme**: Beautiful UI with light orange primary and Indian flag accent colors
- **Role-Based Access Control**: Granular permissions based on user roles
- **Audit Logging**: Track all create, update, and delete operations
- **Data Validation**: Client-side and server-side validation
- **Search & Filtering**: Advanced search and filtering capabilities
- **Pagination**: Efficient data loading with pagination

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with MongoDB Atlas support
- **Authentication**: JWT with secure HTTP-only cookies
- **Validation**: Custom validation utilities
- **Styling**: Tailwind CSS with custom Indian flag color palette

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB installation)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd tuition-management
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Database Setup

Seed the database with initial data:

```bash
npm run seed
```

This will create:
- Admin user: `admin@school.com` / `admin123`
- Moderator user: `moderator@school.com` / `mod123`
- Staff user: `staff@school.com` / `staff123`
- Sample students, teachers, customers, and fee records

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 👥 User Roles & Permissions

### Admin
- Full access to all features
- User management (create, edit, delete users)
- Can delete any records
- Access to system settings

### Moderator
- View and edit all records
- Cannot delete users or change system settings
- Can delete most records except users

### Staff
- Create and edit records they created
- View all records (read-only for others)
- Cannot delete records
- Limited access to sensitive information

## 📱 Key Pages

- **Dashboard**: Overview with statistics and quick actions
- **Students**: List, create, edit, and manage student records
- **Teachers**: Manage teacher profiles and information
- **Customers**: Handle customer/guardian data
- **Transport**: Manage transport services and bookings
- **Fees**: Track fee collections with filtering and search
- **Users**: Admin-only user management
- **Settings**: System configuration (Admin only)

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Resources (Students, Teachers, Customers, Transport, Fees)
- `GET /api/{resource}` - List with pagination and filtering
- `GET /api/{resource}/{id}` - Get single record
- `POST /api/{resource}` - Create new record
- `PUT /api/{resource}/{id}` - Update record
- `DELETE /api/{resource}/{id}` - Delete record

### System
- `GET /api/health` - Health check endpoint

## 🎨 UI/UX Features

### Color Palette
- **Primary**: Light Orange (#FFA726)
- **Accent**: Deep Saffron (#f97316)
- **Success**: India Flag Green (#138808)
- **Info**: Royal Blue (#2563eb)

### Design Principles
- Clean, professional interface
- Consistent spacing and typography
- Accessible color contrasts
- Mobile-first responsive design
- Intuitive navigation with sidebar

## 📊 Database Schema

### Collections
- `users` - System users with roles
- `students` - Student records with parent information
- `teachers` - Teacher profiles and details
- `customers` - Customer/guardian information
- `transport_customers` - Transport service providers
- `fees` - Fee collection records
- `activity_logs` - Audit trail for all operations

### Key Features
- Unique codes for students and teachers
- Audit fields (createdAt, updatedAt, createdBy, updatedBy)
- Proper indexing for performance
- Data validation at database level

## 🔒 Security Features

- Password hashing with bcrypt
- JWT tokens stored in HTTP-only cookies
- Role-based access control middleware
- Input validation and sanitization
- CORS protection
- Rate limiting on authentication endpoints

## 📱 WhatsApp Integration

The system includes manual WhatsApp reminder functionality:
- WhatsApp buttons on student and customer records
- Pre-filled message templates
- Opens WhatsApp Web/App with formatted message
- Customizable message content

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
Ensure all environment variables are properly set:
- Use strong, unique JWT secrets
- Configure proper MongoDB connection string
- Set NODE_ENV=production
- Configure NEXTAUTH_URL to your domain

### Recommended Platforms
- **Vercel**: Seamless Next.js deployment
- **Netlify**: Alternative hosting option
- **Railway**: Full-stack deployment
- **DigitalOcean**: VPS deployment

## 🧪 Testing

The application includes:
- Form validation testing
- API endpoint testing
- Role-based access testing
- Database operation testing

Run tests:
```bash
npm test
```

## 📈 Performance Optimizations

- Database indexing for fast queries
- Pagination for large datasets
- Lazy loading of components
- Optimized images and assets
- Efficient API response caching

## 🔄 Future Enhancements

### Phase 2 Features (Not in MVP)
- Automated notifications and reminders
- Bulk import/export functionality
- PDF receipt generation
- Payment gateway integration
- Multi-tenant support
- Advanced reporting and analytics
- Mobile app (PWA)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the API endpoints
- Check the database schema
- Verify environment variables

## 📝 Changelog

### Version 1.0.0 (MVP)
- Initial release with core functionality
- Multi-role authentication system
- Complete CRUD operations for all entities
- WhatsApp integration
- Responsive design with Indian flag theme
- Database seeding and setup scripts

---

**Built with ❤️ for educational institutions in India**
