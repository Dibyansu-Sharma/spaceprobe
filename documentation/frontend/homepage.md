
**Previous:** [Dashboard](dashboard.md)  
**Next:** [Mock Dashboard](mock-dashboard.md)

---

## `HomePage.js` - Landing Page

This component serves as the **homepage** of the application, providing navigation links to the **real-time dashboard** and the **mock dashboard**.

### **Dependencies**
- **react-router-dom**: Used for navigation via `<Link>`.
- **Tailwind CSS**: Utilized for styling.

### **Code Breakdown**
```jsx
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to SpaceProbe
        </h1>
        <p className="text-gray-600 mb-6">
          Navigate to different sections using the links below.
        </p>
        <div className="space-y-4">
          <Link to="/dashboard" className="block w-full">
            <button className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded px-4 py-2 text-gray-700 hover:bg-gray-100">
              <span>View Real Time Dashboard</span>
            </button>
          </Link>

          <Link to="/mock-dashboard" className="block w-full">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              View Mock Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### **Features**
| Feature                      | Description |
|-----------------------------|-------------|
| **Page Layout**              | The page is centered using `flex` and `min-h-screen`. |
| **Welcome Section**          | Displays a **heading** and a **description**. |
| **Navigation Buttons**       | Provides two navigation buttons: |
|                              | - **"View Real Time Dashboard"** → `/dashboard` |
|                              | - **"View Mock Dashboard"** → `/mock-dashboard` |
| **Tailwind CSS Styling**     | Uses **rounded borders, shadows, padding, and hover effects** for better UI/UX. |

### **Navigation**
- Clicking a button navigates to the respective **dashboard** page.

### **Usage**
Ensure the following:
1. The `Dashboard.js` and `MockDashboard.js` components are correctly implemented.
2. Tailwind CSS is properly configured in your project.

---

**Previous:** [Dashboard](dashboard.md)  
**Next:** [Mock Dashboard](mock-dashboard.md)
