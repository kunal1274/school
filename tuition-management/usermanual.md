# 📖 **User Manual**
## **Tuition Management System with Insurance Module**

---

## **📋 Table of Contents**

1. [Getting Started](#getting-started)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Tuition Module](#tuition-module)
4. [Insurance Module](#insurance-module)
5. [Reports & Analytics](#reports--analytics)
6. [System Administration](#system-administration)
7. [Troubleshooting](#troubleshooting)
8. [Frequently Asked Questions](#frequently-asked-questions)

---

## **🚀 Getting Started**

### **System Requirements**
- **Web Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Internet Connection**: Stable broadband connection
- **Screen Resolution**: Minimum 1024x768 (Recommended: 1920x1080)
- **JavaScript**: Must be enabled

### **Accessing the System**
1. Open your web browser
2. Navigate to the system URL provided by your administrator
3. Enter your login credentials
4. Click "Sign In"

### **First Time Login**
- Use the credentials provided by your system administrator
- Change your password on first login (if required)
- Familiarize yourself with the dashboard layout

---

## **👥 User Roles & Permissions**

### **Admin Role**
**Full system access with all privileges:**
- ✅ User management (create, edit, delete users)
- ✅ System settings configuration
- ✅ Data backup and restore
- ✅ Activity logs access
- ✅ All CRUD operations on all entities
- ✅ Complete reports access

### **Moderator Role**
**Management-level access:**
- ✅ Create, edit, and delete records
- ✅ View all data and reports
- ✅ Manage students, teachers, customers, fees
- ✅ Manage insurance entities
- ❌ Cannot manage users or system settings

### **Staff Role**
**Operational-level access:**
- ✅ View all data
- ✅ Create and edit records
- ✅ Limited delete permissions
- ✅ View reports
- ❌ Cannot delete critical records
- ❌ Cannot manage users or settings

---

## **🎓 Tuition Module**

### **Student Management**

#### **Adding a New Student**
1. Navigate to **Tuition Module** → **Students**
2. Click **"Add Student"** button
3. Fill in the required information:
   - **First Name**: Student's first name (required)
   - **Last Name**: Student's last name (required)
   - **Date of Birth**: Student's birth date (required)
   - **Gender**: Select from dropdown (required)
   - **Class/Batch**: Student's current class (required)
   - **Parent Name**: Parent/guardian name (required)
   - **Parent Phone**: Contact number (required)
   - **Address**: Complete address (required)
   - **Transport Opt-in**: Check if student uses transport
   - **Notes**: Any additional information
   - **Status**: Active/Inactive
4. Click **"Create Student"**
5. Success message will appear, and you'll be redirected to the students list

#### **Viewing Student Details**
1. Go to **Students** list page
2. Click on any student's name or **"View"** button
3. View complete student information including:
   - Personal details
   - Contact information
   - Registration date
   - Status

#### **Editing Student Information**
1. From the students list, click **"Edit"** button
2. Modify the required fields
3. Click **"Update Student"**
4. Changes will be saved and reflected immediately

#### **Searching and Filtering Students**
- **Search**: Use the search box to find students by name
- **Filter by Status**: Select Active/Inactive from dropdown
- **Filter by Transport**: Filter students using transport services
- **Sort**: Click column headers to sort by name, class, or date

#### **Duplicating Student Records**
1. Click **"Duplicate"** button next to any student
2. A new form will open with pre-filled data
3. Modify the necessary fields
4. Click **"Create Student"** to save the duplicate

### **Teacher Management**

#### **Adding a New Teacher**
1. Navigate to **Tuition Module** → **Teachers**
2. Click **"Add Teacher"** button
3. Fill in the teacher information:
   - **Name**: Teacher's full name (required)
   - **Email**: Valid email address (required)
   - **Phone**: Contact number (required)
   - **Subject**: Subject taught (required)
   - **Qualification**: Educational qualification (required)
   - **Experience**: Years of experience (required)
   - **Address**: Complete address (required)
   - **Joining Date**: Date of joining (required)
   - **Salary**: Monthly salary (required)
   - **Status**: Active/Inactive
4. Click **"Create Teacher"**

#### **Managing Teacher Records**
- **View**: Click on teacher name to view details
- **Edit**: Click "Edit" to modify information
- **Duplicate**: Create copy of teacher record
- **Search**: Find teachers by name, subject, or qualification

### **Customer Management**

#### **Adding a New Customer**
1. Navigate to **Tuition Module** → **Customers**
2. Click **"Add Customer"** button
3. Enter customer details:
   - **Name**: Customer's full name (required)
   - **Phone**: Contact number (required)
   - **Email**: Email address (optional)
   - **Address**: Complete address (required)
   - **Relation to Student**: How they're related to student (required)
   - **Notes**: Additional information
   - **Status**: Active/Inactive
4. Click **"Create Customer"**

### **Transport Customer Management**

#### **Adding Transport Customers**
1. Navigate to **Tuition Module** → **Transport**
2. Click **"Add Transport Customer"** button
3. Fill in transport details:
   - **Name**: Customer name (required)
   - **Phone**: Contact number (required)
   - **Vehicle Number**: Vehicle registration (required)
   - **Pickup Point**: Pickup location (required)
   - **Drop Point**: Drop location (required)
   - **Assigned Student**: Link to student (optional)
   - **Fee**: Transport fee amount (required)
   - **Notes**: Additional information
   - **Status**: Active/Inactive
4. Click **"Create Transport Customer"**

### **Fee Management**

#### **Recording Fee Payments**
1. Navigate to **Tuition Module** → **Fees**
2. Click **"Add Fee"** button
3. Enter fee details:
   - **Student**: Select from dropdown (required)
   - **Fee Type**: Type of fee (required)
   - **Amount**: Fee amount (required)
   - **Due Date**: When payment is due (required)
   - **Payment Date**: When payment was made (optional)
   - **Payment Mode**: Cash/Cheque/Online/Bank Transfer (required)
   - **Status**: Paid/Pending/Overdue
   - **Notes**: Additional information
4. Click **"Create Fee"**

#### **Managing Fee Status**
- **Paid**: Payment completed
- **Pending**: Payment not yet received
- **Overdue**: Payment past due date

#### **Fee Tracking Features**
- View payment history for each student
- Track outstanding payments
- Generate payment receipts
- Monitor payment trends

---

## **🛡️ Insurance Module**

### **Insurer Management**

#### **Adding a New Insurer**
1. Navigate to **Insurance Module** → **Insurers**
2. Click **"Add Insurer"** button
3. Enter insurer information:
   - **Name**: Insurance company name (required)
   - **Code**: Unique company code (required)
   - **Contact Person**: Primary contact (required)
   - **Phone**: Contact number (required)
   - **Email**: Email address (required)
   - **Address**: Company address (required)
   - **Website**: Company website (optional)
   - **License Number**: Insurance license (required)
   - **Status**: Active/Inactive
4. Click **"Create Insurer"**

### **Policy Management**

#### **Creating Insurance Policies**
1. Navigate to **Insurance Module** → **Policies**
2. Click **"Add Policy"** button
3. Define policy details:
   - **Insurer**: Select insurance company (required)
   - **Policy Name**: Policy title (required)
   - **Premium Amount**: Premium cost (required)
   - **Premium Frequency**: Monthly/Quarterly/Yearly (required)
   - **Min Cover Amount**: Minimum coverage (required)
   - **Max Cover Amount**: Maximum coverage (required)
   - **Description**: Policy details (optional)
   - **Terms & Conditions**: Policy terms (optional)
   - **Status**: Active/Inactive
4. Click **"Create Policy"**

### **Customer Policy Management**

#### **Assigning Policies to Customers**
1. Navigate to **Insurance Module** → **Customer Policies**
2. Click **"Add Customer Policy"** button
3. Link customer to policy:
   - **Customer**: Select customer (required)
   - **Policy**: Select policy (required)
   - **Start Date**: Policy start date (required)
   - **End Date**: Policy end date (required)
   - **Premium Amount**: Premium for this customer (required)
   - **Payment Frequency**: How often premium is paid (required)
   - **Status**: Active/Lapsed/Cancelled/Expired
4. Click **"Create Customer Policy"**

### **Policy Payment Management**

#### **Recording Premium Payments**
1. Navigate to **Insurance Module** → **Policy Payments**
2. Click **"Add Policy Payment"** button
3. Record payment details:
   - **Customer Policy**: Select policy (required)
   - **Amount**: Payment amount (required)
   - **Payment Date**: When payment was made (required)
   - **Payment Mode**: Payment method (required)
   - **Transaction ID**: Unique transaction reference (required)
   - **Notes**: Additional information
4. Click **"Create Policy Payment"**

### **Claims Management**

#### **Submitting Insurance Claims**
1. Navigate to **Insurance Module** → **Claims**
2. Click **"Add Claim"** button
3. Enter claim information:
   - **Customer Policy**: Select policy (required)
   - **Date of Event**: When incident occurred (required)
   - **Amount Claimed**: Claim amount (required)
   - **Amount Approved**: Approved amount (optional)
   - **Status**: Draft/Submitted/Under Review/Approved/Rejected/Settled
   - **Description**: Detailed incident description (required)
   - **Supporting Documents**: Upload relevant files (optional)
4. Click **"Create Claim"**

#### **Claim Status Workflow**
1. **Draft**: Initial claim creation
2. **Submitted**: Claim submitted for review
3. **Under Review**: Claim being evaluated
4. **Approved**: Claim approved for payment
5. **Rejected**: Claim rejected with reasons
6. **Settled**: Claim payment completed

---

## **📊 Reports & Analytics**

### **Tuition Reports**

#### **Accessing Reports**
1. Navigate to **Tuition Module** → **Tuition Reports**
2. Select report type from the dashboard
3. Apply filters as needed
4. View and export reports

#### **Available Reports**
- **Student Reports**: Student lists, class-wise reports, transport reports
- **Fee Reports**: Collection reports, outstanding payments, payment trends
- **Teacher Reports**: Teacher directory, subject-wise reports
- **Revenue Reports**: Income tracking, fee collection analysis

### **Insurance Reports**

#### **Insurance Analytics**
1. Navigate to **Insurance Module** → **Insurance Reports**
2. View comprehensive insurance analytics:
   - **Policy Summary**: Active, lapsed, cancelled policies
   - **Premium Reports**: Collection and outstanding premiums
   - **Claims Reports**: Claims by status and amount
   - **Performance Metrics**: Insurer performance analysis

#### **Report Features**
- **Date Range Filtering**: Filter reports by date range
- **Insurer Filtering**: Filter by specific insurance companies
- **Status Filtering**: Filter by policy or claim status
- **Export Options**: Export reports to CSV format

---

## **⚙️ System Administration**

### **User Management (Admin Only)**

#### **Creating New Users**
1. Navigate to **Users** (Admin menu)
2. Click **"Add User"** button
3. Enter user details:
   - **Name**: User's full name (required)
   - **Email**: Valid email address (required)
   - **Password**: Secure password (required)
   - **Confirm Password**: Re-enter password (required)
   - **Role**: Admin/Moderator/Staff (required)
   - **Phone**: Contact number (optional)
   - **Status**: Active/Inactive
4. Click **"Create User"**

#### **Managing User Accounts**
- **Edit User**: Modify user information and roles
- **Toggle Status**: Activate/deactivate user accounts
- **Delete User**: Remove user accounts (with confirmation)
- **Reset Password**: Generate new password for users

### **System Settings (Admin Only)**

#### **Configuring System Settings**
1. Navigate to **Settings** (Admin menu)
2. Configure various system parameters:
   - **School Information**: Name, address, contact details
   - **Currency Settings**: Default currency and format
   - **Notification Settings**: Email, SMS, WhatsApp preferences
   - **Backup Settings**: Automatic backup configuration
   - **Security Settings**: Password policies, session timeouts

### **Activity Logs (Admin Only)**

#### **Viewing System Activity**
1. Navigate to **Activity Logs** (Admin menu)
2. View comprehensive activity logs:
   - **User Actions**: All user activities
   - **Data Changes**: Record modifications
   - **System Events**: Login/logout activities
   - **Filter Options**: Filter by user, date, action type

### **Backup & Restore (Admin Only)**

#### **Creating System Backups**
1. Navigate to **Backup & Restore** (Admin menu)
2. Click **"Create Backup"** button
3. System will create a complete data backup
4. Download backup file for safekeeping

#### **Restoring from Backup**
1. Go to **Backup & Restore** page
2. Click **"Restore"** next to desired backup
3. Confirm restoration (this will overwrite current data)
4. System will restore data from selected backup

---

## **🔧 Troubleshooting**

### **Common Issues**

#### **Login Problems**
**Issue**: Cannot log in to the system
**Solutions**:
- Check username and password spelling
- Ensure Caps Lock is not enabled
- Clear browser cache and cookies
- Contact administrator if account is locked

#### **Page Loading Issues**
**Issue**: Pages not loading or loading slowly
**Solutions**:
- Check internet connection
- Refresh the page (F5 or Ctrl+R)
- Clear browser cache
- Try a different browser
- Disable browser extensions temporarily

#### **Form Submission Errors**
**Issue**: Cannot save forms or getting validation errors
**Solutions**:
- Check all required fields are filled
- Verify data format (email, phone, dates)
- Ensure no special characters in text fields
- Try refreshing the page and re-entering data

#### **Search Not Working**
**Issue**: Search functionality not returning results
**Solutions**:
- Check spelling of search terms
- Try broader search terms
- Clear search filters
- Refresh the page

### **Browser Compatibility**

#### **Supported Browsers**
- **Chrome**: Version 90 and above
- **Firefox**: Version 88 and above
- **Safari**: Version 14 and above
- **Edge**: Version 90 and above

#### **Browser Settings**
- **JavaScript**: Must be enabled
- **Cookies**: Must be allowed
- **Pop-ups**: Allow for reports and exports
- **Cache**: Clear cache if experiencing issues

---

## **❓ Frequently Asked Questions**

### **General Questions**

**Q: How do I change my password?**
A: Contact your system administrator to reset your password. Password changes are managed by administrators for security purposes.

**Q: Can I access the system from my mobile device?**
A: Yes, the system is fully responsive and works on mobile devices, tablets, and desktop computers.

**Q: What should I do if I forget my login credentials?**
A: Contact your system administrator who can reset your password and provide new login credentials.

**Q: How often should I backup my data?**
A: The system automatically creates backups, but administrators can create manual backups before major changes.

### **Student Management Questions**

**Q: Can I edit student information after creation?**
A: Yes, you can edit student information by clicking the "Edit" button next to any student record.

**Q: What happens when I delete a student?**
A: Student deletion is permanent. Make sure you have backups before deleting any student records.

**Q: Can I search for students by parent name?**
A: Yes, the search function allows you to find students by parent name, student name, or phone number.

### **Fee Management Questions**

**Q: How do I mark a fee as paid?**
A: When creating or editing a fee record, set the status to "Paid" and enter the payment date.

**Q: Can I generate receipts for fee payments?**
A: Yes, the system can generate payment receipts for all fee transactions.

**Q: How do I track overdue payments?**
A: Use the fee reports to filter by "Overdue" status to see all pending payments.

### **Insurance Questions**

**Q: How do I assign a policy to multiple customers?**
A: You need to create separate customer policy records for each customer-policy combination.

**Q: Can I track claim status changes?**
A: Yes, the system maintains a complete history of claim status changes and updates.

**Q: How do I calculate premium amounts?**
A: Premium amounts are set at the policy level and can be customized for individual customers.

### **Reporting Questions**

**Q: Can I export reports to Excel?**
A: Yes, most reports can be exported to CSV format which can be opened in Excel.

**Q: How do I filter reports by date range?**
A: Use the date range filters available in the reports section to specify custom date ranges.

**Q: Can I schedule automatic report generation?**
A: Currently, reports are generated on-demand. Automatic scheduling may be available in future updates.

---

## **📞 Support & Contact**

### **Getting Help**
- **System Administrator**: Contact your local system administrator for account issues
- **Technical Support**: For technical issues, contact the development team
- **Training**: Request additional training sessions for new features

### **System Information**
- **Version**: 2.0
- **Last Updated**: December 2024
- **Browser Requirements**: Modern browsers with JavaScript enabled
- **Mobile Support**: Full responsive design

### **Best Practices**
- **Regular Backups**: Ensure regular data backups are performed
- **User Training**: Keep users trained on system features
- **Security**: Use strong passwords and log out when finished
- **Updates**: Keep the system updated with latest features

---

## **📚 Additional Resources**

### **Training Materials**
- **Video Tutorials**: Available for key system features
- **User Guides**: Detailed guides for each module
- **FAQ Updates**: Regularly updated frequently asked questions

### **System Updates**
- **Release Notes**: Information about new features and improvements
- **Maintenance Windows**: Scheduled system maintenance periods
- **Feature Requests**: Submit requests for new functionality

---

*This user manual is regularly updated to reflect the latest system features and improvements. For the most current information, always refer to the latest version of this manual.*