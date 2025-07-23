# PlantCraft Frontend Screens

Tài liệu mô tả chi tiết các màn hình cần có trong hệ thống PlantCraft Frontend.

## 1. Authentication Screens

### 1.1 Login Screen
- **Route**: `/login`
- **Purpose**: Đăng nhập vào hệ thống
- **Components**:
  - Email input field
  - Password input field
  - Login button
  - "Forgot password?" link
  - "Register" link
- **API Endpoints**: `POST /api/auth/login`
- **Features**:
  - Form validation
  - Remember me checkbox
  - Social login options (optional)

### 1.2 Register Screen
- **Route**: `/register`
- **Purpose**: Đăng ký tài khoản mới
- **Components**:
  - Name input field
  - Email input field
  - Password input field
  - Confirm password field
  - Register button
  - "Already have account?" link
- **API Endpoints**: `POST /api/auth/register`
- **Features**:
  - Form validation
  - Password strength indicator
  - Terms and conditions checkbox

### 1.3 Email Verification Screen
- **Route**: `/verify-email`
- **Purpose**: Xác thực email sau khi đăng ký
- **Components**:
  - Verification code input
  - Verify button
  - Resend code button
  - Timer countdown
- **API Endpoints**: `POST /api/auth/verify-email`
- **Features**:
  - Auto-focus on code input
  - Auto-submit when code is complete

### 1.4 Forgot Password Screen
- **Route**: `/forgot-password`
- **Purpose**: Yêu cầu reset mật khẩu
- **Components**:
  - Email input field
  - Send reset link button
  - Back to login link
- **API Endpoints**: `POST /api/auth/request-reset`
- **Features**:
  - Email validation
  - Success message display

### 1.5 Reset Password Screen
- **Route**: `/reset-password`
- **Purpose**: Đặt lại mật khẩu mới
- **Components**:
  - New password input field
  - Confirm new password field
  - Reset button
- **API Endpoints**: `POST /api/auth/reset-password`
- **Features**:
  - Password strength indicator
  - Token validation from URL

## 2. User Profile Screens

### 2.1 Profile Screen
- **Route**: `/profile`
- **Purpose**: Xem và cập nhật thông tin cá nhân
- **Components**:
  - Profile picture upload
  - Name input field
  - Email display (read-only)
  - Save button
  - Change password section
- **API Endpoints**: 
  - `GET /api/user/profile`
  - `PUT /api/user/profile`
- **Features**:
  - Image preview
  - Form validation
  - Auto-save option

### 2.2 Settings Screen
- **Route**: `/settings`
- **Purpose**: Cài đặt tài khoản và hệ thống
- **Components**:
  - Notification settings
  - Privacy settings
  - Theme preferences
  - Language settings
  - Account deletion option
- **Features**:
  - Real-time settings update
  - Confirmation dialogs

## 3. Dashboard Screens

### 3.1 Main Dashboard
- **Route**: `/dashboard`
- **Purpose**: Tổng quan về tiến độ và nhiệm vụ
- **Components**:
  - Progress overview cards
  - Today's tasks list
  - Recent goals
  - Quick actions
  - Statistics charts
- **API Endpoints**:
  - `GET /api/goals`
  - `GET /api/tasks/today`
  - `GET /api/goals/stats`
- **Features**:
  - Real-time updates
  - Drag and drop for quick actions
  - Responsive design

### 3.2 Analytics Dashboard
- **Route**: `/analytics`
- **Purpose**: Phân tích chi tiết hiệu suất
- **Components**:
  - Performance charts
  - Goal completion trends
  - Task statistics
  - Time tracking graphs
  - Productivity insights
- **API Endpoints**:
  - `GET /api/tasks/statistics`
  - `GET /api/goals/stats`
- **Features**:
  - Interactive charts
  - Date range filters
  - Export functionality

## 4. Goals Management Screens

### 4.1 Goals List Screen
- **Route**: `/goals`
- **Purpose**: Xem danh sách tất cả mục tiêu
- **Components**:
  - Goals grid/list view
  - Filter options (status, priority)
  - Search functionality
  - Create goal button
  - Sort options
- **API Endpoints**: `GET /api/goals`
- **Features**:
  - Pagination
  - Bulk actions
  - Quick status updates

### 4.2 Create Goal Screen
- **Route**: `/goals/create`
- **Purpose**: Tạo mục tiêu mới
- **Components**:
  - Goal name input
  - Description textarea
  - Deadline picker
  - Priority selector
  - Create button
  - Cancel button
- **API Endpoints**: `POST /api/goals`
- **Features**:
  - Form validation
  - Auto-save draft
  - Template selection

### 4.3 Goal Detail Screen
- **Route**: `/goals/:id`
- **Purpose**: Xem chi tiết mục tiêu
- **Components**:
  - Goal information
  - Progress bar
  - Phases list
  - Tasks overview
  - Edit/Delete buttons
- **API Endpoints**:
  - `GET /api/goals/:id`
  - `GET /api/goals/:id/progress-with-phases`
- **Features**:
  - Real-time progress updates
  - Quick actions menu

### 4.4 Edit Goal Screen
- **Route**: `/goals/:id/edit`
- **Purpose**: Chỉnh sửa thông tin mục tiêu
- **Components**:
  - Pre-filled form fields
  - Save button
  - Cancel button
  - Delete option
- **API Endpoints**: `PUT /api/goals/:id`
- **Features**:
  - Form validation
  - Change history

### 4.5 Goal Progress Screen
- **Route**: `/goals/:id/progress`
- **Purpose**: Theo dõi tiến độ mục tiêu
- **Components**:
  - Progress visualization
  - Timeline chart
  - Milestone tracking
  - Performance analysis
  - Recommendations
- **API Endpoints**: `GET /api/goals/:id/progress`
- **Features**:
  - Interactive timeline
  - Progress predictions
  - Achievement badges

### 4.6 Goal Roadmap Screen
- **Route**: `/goals/:id/roadmap`
- **Purpose**: Xem roadmap chi tiết của mục tiêu
- **Components**:
  - Phase timeline
  - Task dependencies
  - Milestone markers
  - Progress indicators
- **API Endpoints**: `GET /api/goals/:id/roadmap`
- **Features**:
  - Interactive roadmap
  - Zoom in/out
  - Print/export

## 5. Goal Phases Management Screens

### 5.1 Phases List Screen
- **Route**: `/goals/:goalId/phases`
- **Purpose**: Quản lý các giai đoạn của mục tiêu
- **Components**:
  - Phases list with progress
  - Add phase button
  - Reorder functionality
  - Phase status indicators
- **API Endpoints**: `GET /api/goals/:goalId/phases`
- **Features**:
  - Drag and drop reordering
  - Quick phase status updates

### 5.2 Create Phase Screen
- **Route**: `/goals/:goalId/phases/create`
- **Purpose**: Tạo giai đoạn mới
- **Components**:
  - Phase title input
  - Description textarea
  - Order number input
  - Create button
- **API Endpoints**: `POST /api/goals/:goalId/phases`
- **Features**:
  - Auto-order numbering
  - Template selection

### 5.3 Phase Detail Screen
- **Route**: `/goals/:goalId/phases/:phaseId`
- **Purpose**: Xem chi tiết giai đoạn
- **Components**:
  - Phase information
  - Tasks list
  - Progress statistics
  - Edit/Delete options
- **API Endpoints**:
  - `GET /api/goals/:goalId/phases/:phaseId`
  - `GET /api/goals/:goalId/phases/:phaseId/stats`
- **Features**:
  - Task management within phase
  - Progress tracking

### 5.4 Edit Phase Screen
- **Route**: `/goals/:goalId/phases/:phaseId/edit`
- **Purpose**: Chỉnh sửa thông tin giai đoạn
- **Components**:
  - Pre-filled form fields
  - Save button
  - Cancel button
- **API Endpoints**: `PUT /api/goals/:goalId/phases/:phaseId`
- **Features**:
  - Form validation
  - Order number adjustment

## 6. Tasks Management Screens

### 6.1 Tasks List Screen
- **Route**: `/tasks`
- **Purpose**: Xem tất cả nhiệm vụ
- **Components**:
  - Tasks list/grid
  - Filter options
  - Search functionality
  - Create task button
  - Bulk actions
- **API Endpoints**: `GET /api/tasks`
- **Features**:
  - Multiple view modes
  - Advanced filtering
  - Export functionality

### 6.2 Today's Tasks Screen
- **Route**: `/tasks/today`
- **Purpose**: Xem nhiệm vụ hôm nay
- **Components**:
  - Today's tasks list
  - Priority indicators
  - Time estimates
  - Quick status updates
- **API Endpoints**: `GET /api/tasks/today`
- **Features**:
  - Drag and drop prioritization
  - Quick completion
  - Time tracking

### 6.3 Create Task Screen
- **Route**: `/tasks/create`
- **Purpose**: Tạo nhiệm vụ mới
- **Components**:
  - Task title input
  - Description textarea
  - Goal/Phase selection
  - Deadline picker
  - Priority selector
  - Create button
- **API Endpoints**: `POST /api/tasks`
- **Features**:
  - Goal/Phase auto-suggestion
  - Template selection
  - Recurring task options

### 6.4 Task Detail Screen
- **Route**: `/tasks/:id`
- **Purpose**: Xem chi tiết nhiệm vụ
- **Components**:
  - Task information
  - Status updates
  - Comments section
  - Time tracking
  - Related tasks
- **API Endpoints**:
  - `GET /api/tasks/:id`
  - `PUT /api/tasks/:id/status`
- **Features**:
  - Real-time updates
  - File attachments
  - Task dependencies

### 6.5 Phase Tasks Screen
- **Route**: `/goals/:goalId/phases/:phaseId/tasks`
- **Purpose**: Quản lý nhiệm vụ trong giai đoạn
- **Components**:
  - Phase information header
  - Tasks list
  - Add task button
  - Task status filters
  - Move task functionality
- **API Endpoints**:
  - `GET /api/goals/:goalId/phases/:phaseId/tasks`
  - `POST /api/goals/:goalId/phases/:phaseId/tasks`
- **Features**:
  - Drag and drop between phases
  - Bulk task operations
  - Progress visualization

## 7. Progress Tracking Screens

### 7.1 Progress Overview Screen
- **Route**: `/progress`
- **Purpose**: Tổng quan tiến độ tất cả mục tiêu
- **Components**:
  - Overall progress chart
  - Goals progress list
  - Completion trends
  - Performance metrics
- **API Endpoints**:
  - `GET /api/goals/stats`
  - `GET /api/tasks/statistics`
- **Features**:
  - Interactive charts
  - Date range selection
  - Progress comparisons

### 7.2 Goal Progress Detail Screen
- **Route**: `/goals/:id/progress-detail`
- **Purpose**: Chi tiết tiến độ mục tiêu cụ thể
- **Components**:
  - Goal progress chart
  - Phase breakdown
  - Timeline visualization
  - Performance analysis
  - Recommendations
- **API Endpoints**: `GET /api/goals/:id/progress`
- **Features**:
  - Interactive timeline
  - Progress predictions
  - Achievement tracking

### 7.3 Phase Progress Screen
- **Route**: `/goals/:goalId/phases/:phaseId/progress`
- **Purpose**: Theo dõi tiến độ giai đoạn
- **Components**:
  - Phase progress chart
  - Tasks completion status
  - Time tracking
  - Performance metrics
- **API Endpoints**: `GET /api/goals/:goalId/phases/:phaseId/stats`
- **Features**:
  - Real-time updates
  - Task dependency visualization

## 8. Statistics and Reports Screens

### 8.1 Statistics Dashboard
- **Route**: `/statistics`
- **Purpose**: Thống kê tổng hợp
- **Components**:
  - Completion rate charts
  - Productivity metrics
  - Time analysis
  - Goal achievement trends
- **API Endpoints**:
  - `GET /api/tasks/statistics`
  - `GET /api/goals/stats`
- **Features**:
  - Interactive charts
  - Date range filters
  - Export reports

### 8.2 Performance Reports Screen
- **Route**: `/reports`
- **Purpose**: Báo cáo hiệu suất chi tiết
- **Components**:
  - Performance reports
  - Goal completion reports
  - Time tracking reports
  - Productivity analysis
- **Features**:
  - Custom report generation
  - PDF export
  - Email scheduling

## 9. Notification and Communication Screens

### 9.1 Notifications Screen
- **Route**: `/notifications`
- **Purpose**: Quản lý thông báo
- **Components**:
  - Notifications list
  - Mark as read functionality
  - Notification settings
  - Filter options
- **Features**:
  - Real-time notifications
  - Push notifications
  - Email notifications

### 9.2 Messages Screen
- **Route**: `/messages`
- **Purpose**: Hệ thống tin nhắn (nếu có tính năng team)
- **Components**:
  - Messages list
  - Compose message
  - Search functionality
  - Message threads
- **Features**:
  - Real-time messaging
  - File sharing
  - Message history

## 10. Help and Support Screens

### 10.1 Help Center Screen
- **Route**: `/help`
- **Purpose**: Trung tâm trợ giúp
- **Components**:
  - FAQ section
  - Tutorial videos
  - User guide
  - Contact support
- **Features**:
  - Search functionality
  - Interactive tutorials
  - Feedback system

### 10.2 Settings and Preferences Screen
- **Route**: `/settings`
- **Purpose**: Cài đặt hệ thống
- **Components**:
  - Account settings
  - Notification preferences
  - Theme settings
  - Language settings
  - Privacy settings
- **Features**:
  - Real-time settings update
  - Profile management

## 11. Mobile Responsive Considerations

### 11.1 Mobile Navigation
- **Components**:
  - Bottom navigation bar
  - Hamburger menu
  - Swipe gestures
  - Touch-friendly buttons
- **Features**:
  - Responsive design
  - Offline functionality
  - Push notifications

### 11.2 Mobile-Optimized Screens
- **Dashboard**: Simplified cards layout
- **Goals List**: Swipe actions
- **Task Management**: Quick actions
- **Progress Tracking**: Simplified charts

## 12. Common UI Components

### 12.1 Navigation Components
- Header with user menu
- Sidebar navigation
- Breadcrumbs
- Search bar

### 12.2 Data Display Components
- Progress bars
- Status badges
- Priority indicators
- Date/time displays

### 12.3 Interactive Components
- Modal dialogs
- Tooltips
- Dropdown menus
- Date pickers
- File uploaders

### 12.4 Feedback Components
- Loading spinners
- Success/error messages
- Confirmation dialogs
- Toast notifications

## 13. Accessibility Features

### 13.1 Screen Reader Support
- ARIA labels
- Semantic HTML
- Keyboard navigation
- Focus management

### 13.2 Visual Accessibility
- High contrast mode
- Font size adjustment
- Color blind friendly
- Reduced motion

## 14. Performance Considerations

### 14.1 Loading States
- Skeleton screens
- Progressive loading
- Lazy loading
- Caching strategies

### 14.2 Optimization
- Image optimization
- Code splitting
- Bundle optimization
- CDN usage

## 15. Security Features

### 15.1 Authentication
- JWT token management
- Session handling
- Auto-logout
- Secure storage

### 15.2 Data Protection
- Input validation
- XSS prevention
- CSRF protection
- HTTPS enforcement 