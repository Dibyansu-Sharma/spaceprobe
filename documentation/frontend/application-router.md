
**Next:** [Dashboard](dashboard.md)

---

### `App.js` - Application Router

This file defines the main entry point for the frontend application using **React Router** to handle navigation between different pages.

#### **Dependencies**
- **react-router-dom**: Used for client-side routing.

#### **Routes**
| Path              | Component       | Description                           |
|------------------|---------------|-----------------------------------|
| `/`              | `HomePage`      | Displays the home page.           |
| `/dashboard`     | `Dashboard`     | Displays the main dashboard.      |
| `/mock-dashboard` | `MockDashboard` | Displays a mock dashboard for testing. |

#### **Code Breakdown**
```jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import Dashboard from "./Dashboard";
import MockDashboard from "./MockDashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mock-dashboard" element={<MockDashboard />} />
      </Routes>
    </Router>
  );
}
```

- **Router (`<Router>`)**: Wraps the entire application to enable routing.
- **Routes (`<Routes>`)**: Defines the available routes in the app.
- **Route (`<Route path="..." element={<Component />}`)**: Specifies the path and corresponding component.

#### **Usage**
Ensure that the components (`HomePage`, `Dashboard`, `MockDashboard`) are correctly implemented and imported. 

---
**Next:** [Dashboard](dashboard.md)

