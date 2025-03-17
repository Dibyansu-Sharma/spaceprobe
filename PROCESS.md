# Log 02:09 AM 15.03.2025  

## Goal - Create a Weather Check Application 
First and foremost keep a name - SpaceProbe 
Create a simple application that:  
- Generates mock sensor data (temperature, AQI, occupancy, etc.).  adding humidity, pressure, timestamp, visibility and  reliability_score
- Collects this data through a TCP server.  
- Stores readings in PostgreSQL.  
- Pushes real-time updates through WebSockets.  
- Displays the data on a React dashboard with basic visualization.  

## Starting with Backend  

1. **Go was mandatory**, no second thoughts.  
2. **PostgreSQL over MySQL** – PostgreSQL scales better for complex queries as data grows.
3. **WebSockets** – For real-time updates.  
4. **Error Handling & Logging** – For debugging and monitoring sensor reliability.  

## Found GORM - 
GORM is used as an ORM to simplify database interactions, migrations, and struct-to-table mapping, reducing the need for raw SQL.  
- Docs: [how-to-create-a-postgres-database-using-gorm](https://stackoverflow.com/questions/54048774/how-to-create-a-postgres-database-using-gorm)  

## Schema Design
Keeping in mind there will be multiple sensors and each will have a reliability score, and the table structure is:  

```sql
id SERIAL PRIMARY KEY  
sensor_id VARCHAR NOT NULL  
temperature FLOAT  
humidity FLOAT  
pressure DOUBLE  
visibility FLOAT  
aqi FLOAT  
occupancy INTEGER  
reliability_score FLOAT DEFAULT 1.0  
updated_at TIMESTAMP  
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
```

## Next Steps  

### Implement Reliability Score Calculation  
- Define logic based on data variance and update frequency.  
- Store and update reliability score dynamically.  

### WebSocket Integration  
- Set up WebSocket server in Go.  
- Push real-time sensor updates to connected clients.  

### Frontend
- Fetch and display real-time data.  
- Use graphs and charts for visualization.  
- Show reliability scores, sensor metrics, and live updates.  

### Error Handling & Logging Enhancements  
- Improve logging for failures in data parsing, DB operations, and WebSockets.  

# Log 18:31 15.03.2025  

### Implement Reliability Score Calculation  
- Define logic based on data variance and update frequency.  
- Store and update reliability score dynamically.  

### Efficient Variance Calculation for Sensor Readings

I'm considering how to efficiently calculate variance for sensor readings. A high variance would indicate outliers, and the formula for variance is:

```
s^2 = (summation  ( xi - xbar ) ^ 2) / n - 1
 xbar -> mean
 xi -> element
```

However, implementing this calculation with the current schema design seems inefficient. Fetching all records for a given `sensor_id`, computing the variance, and updating each row would be costly performance.

### Proposed Optimization  

To optimize this, I plan to introduce a new table, `sensor_reliability`, which will store:  

- `sensor_id` (Primary Key)  
- `reliability_score`  
- `variance`
- `mean`

This allows us to efficiently retrieve sensor reliability via direct queries or joins, instead of recalculating it repeatedly.

### Efficient Variance Calculation  

Now, the challenge is to maintain variance and mean efficiently. Instead of recalculating from all past readings every time, I need a way to update variance incrementally as new data arrives.

The current query:  

```sql
SELECT temperature FROM sensor_readings WHERE sensor_id = sensor_id 
```

is inefficient because it fetches multiple rows to compute variance

Upon researching, I found Welford's Algorithm, which is a one pass algorithm to calculate variance. This avoids iterating over all past data while still maintaining an accurate variance calculation.

Article on Welford's Algorithm
[welford method](https://jonisalonen.com/2013/deriving-welfords-method-for-computing-variance/)

Reliability Calculation - 
Formula - 
```
The expression `mean*frequency/variance` - ratio that combines three fundamental statistical measures:

Keeping latest 10 records for calculation - 
Mean - the average value of a dataset
Frequency - how often sensor data is fetched
Variance - how spread out the values are from the mean

A higher value suggests more reliable data. The ratio increases with higher mean values and frequencies, but decreases with higher variance which can be interpreted as noise.
```
## Sensor Reliability Approaches

I thought of below two approaches and went with the option 1.

### Option 1: Start with Reliability = 0 and build up 

* Starting with zero reliability and increasing based on mean and frequency is intuitive
* Higher frequency = more data points = more confidence
* Higher mean (assuming temperature is what you're measuring) could indicate more stable readings
* Lower variance would naturally lead to higher reliability as readings are more consistent

### Option 2: Start with Reliability = 1 and apply penalties

* Starting with perfect reliability and applying penalties for variance changes
* This would indeed introduce complexity around:
   * Handling the first data point (no previous variance to compare)
   * Defining an appropriate penalty function
   * Handling edge cases like sensor restarts

First approach is cleaner and simpler to implement and understand

# Log 2:34 AM 16.03.2025

### WebSocket Integration  
- Set up WebSocket server in Go.  
- Push real-time sensor updates to connected clients.  

### Option 1 - Go with net/http for web sockets - 
    -  No External Dependencies PRO
    -  No built-in JSON handling, ping/pong CON 

### Option 2 - Go with Gorilla WebSocket- 
    -  External Dependencies. COMPLEX CON
    -  Supports message compression, ping/pong handling, subprotocols, and connection upgrades, 
    -  Handles edge cases like abrupt connection closures and helps prevent memory leaks PRO 


Gorilla WebSocket seems to be the better choice. Tutorial to implement - [Tutorial](https://dev.to/davidnadejdin/simple-server-on-gorilla-websocket-52h7)

Components Till Now - 
TCP Server (server.go)
 - Continuously generates mock sensor data and sends it via TCP
TCP Listener (main.go)
- Receives TCP data, saves it to the database, and notifies WebSocket clients
WebSocket Server (ws/ws.go)
- Manages client connections and subscriptions
- Sends real-time updates only to clients subscribed to specific sensors
how clients tell your server which sensors they're interested in. Without this subscription mechanism:

WebSocket server would need to send ALL sensor data to ALL connected clients
Each dashboard would receive data for sensors it doesn't need to display

WebSocket would send the latest data from a specific sensor when new data is received. However, if the current sensor's reliability is low due to high variance, React UI should be able to fetch the most reliable sensor data instead - `If the current sensor's reliability is low, the UI fetches the best available sensor from the database instead`

ISSUE - 
If a sensor had a high reliability score but stopped reporting new data, the UI would still display its last known data, which might be outdated

FIX - 
Modify the query to only consider recent sensor readings, for example, from the last 10 minutes


# Log - 16:40, 17.03.2025

## Frontend Development

### Features Implemented:
- Fetched and displayed real-time data.
- Used graphs and charts for visualization.
- Showed reliability scores, sensor metrics, and live updates.

### Tech Stack Decision:
- **Vite + React**: Chosen over Create React App (CRA) due to its deprecation and better optionality.
- **Tailwind CSS**: Continued usage for styling.
- **ShadCN**: currently used for component management.

### WebSocket Implementation:
- **Issue:** Encountered WebSocket error `1001 (Going Away)`, caused by frequent connect-disconnect cycles from the UI.
- **Fix:** 
  - Added `connectWebSocket` and `selectedSensor` as dependencies in `useEffect`.
  - Used `useCallback` to cache functions and prevent unnecessary re-renders.

### Data Handling:
- **Reliability Score:** Not initially sent by the server. Updated the backend to include it.
- **Formatting:** Created utility functions to format the response data for consistency.
- **Rendering:** 
  - Developed simple **card components** to display formatted data.
  - Used references to create **charts and graphs**.

### Identified Gap:
- **Subscription Limitation:** 
  - Users can subscribe to a specific sensor.
  - However, the server only sends the **most reliable** sensor data.
  - If the selected sensor is **unreliable**, no data is received.
  - **Next Step:** Modify the server to handle and send unreliable sensor data as well.

---

### Next Steps:
- Fix server implementation to allow displaying chosen sensor data even if it's unreliable.
- Clean and error handling, test for edge cases

# Log 16:56 17.03.2025
---

### **UI Refactor**  

- Previously, the entire UI logic was contained in a single file (`App.tsx`). While functional, this setup would become a major technical debt as the application scales.  
- The UI has been refactored to introduce a **Home page**, which provides navigation to:  
  1. **Real-Time Dashboard** – Connects to the WebSocket to fetch live updates.  
  2. **Mock Dashboard** – Displays sample data to allow UI testing even if the WebSocket is unavailable.  
- A **Reconnect Button** has been added to the Real-Time Dashboard, allowing users to manually reconnect to the WebSocket without refreshing the page.  
- Introduced a **Stat Card Component** under `/components`, which is reusable across both dashboards to maintain consistency and reduce redundancy.  

---

### **Hosting Strategy**  

- To deploy the application at minimal cost, I explored multiple hosting strategies. While **PostgreSQL** offers a free tier, it has a limited memory allocation, which would fill up quickly since data is generated every 5 seconds. Additionally, WebSocket hosting incurs extra costs.  
- An alternative approach I tested is using **Cloudflare Tunnel** to expose the backend running on my local machine. This allows the WebSocket to be accessible via a stable domain that the UI can connect to in production.  
- The Cloudflare Tunnel setup works as expected, but it has a drawback—it requires the backend server to be continuously running on the local machine, effectively making it a self-hosted server.  

---

### Setup Instructions 

### **Setup Instructions for SpaceProbe Backend**  

Follow these steps to set up and run the **SpaceProbe Backend** on your local machine.  

**Prerequisites:**

- **Go**: Ensure you have Go version >=1.24.1 installed.
- **PostgreSQL**: Ensure PostgreSQL >=17.4 is installed and running on `localhost`.
- **Node.js and npm**: Ensure you have Node.js (version 18.3.1 or compatible) and npm installed.
---

### **1. Clone the Repository**  
```sh
git clone https://github.com/Dibyansu-Sharma/spaceprobe.git
cd spaceprobe
```

---

### **2. Create a `.env` File**  
Copy the example environment file and modify it as needed:  
```sh
cp .env.example .env
```
Edit the `.env` file with your preferred configuration values.

---

### **3. Initialize Go Module (if not already done)**  
```sh
go mod init spaceprobe-backend
```

---

### **4. Install Required Dependencies**  
Run the following commands to install all necessary Go packages:  
```sh
# Load environment variables from a .env file
go get github.com/joho/godotenv

# WebSockets support
go get github.com/gorilla/websocket

# PostgreSQL driver for GORM
go get gorm.io/driver/postgres
go get gorm.io/gorm
```

After installing the dependencies, tidy up the module:
```sh
go mod tidy
```

---

### **5. Run the Application**  
Once everything is set up, start the backend server:  
```sh
go run .
```

Backend should now be up and running


### **Setup Instructions for SpaceProbe Frontend**
---
### **1. Frontend Setup**
```sh
cd ../frontend
```
### **2. Create a `.env` File**  
Copy the example environment file and modify it as needed:  
```sh
cp .env.local.example .env.local
```
Edit the `.env` file with your preferred configuration values.

### **3. Install Dependencies**
```sh
  npm install
```
### **4. Start the Frontend Server**
```sh
  npm run dev
```
---
The UI runs on **port 5173** (by default).


## Code Challenge Feedback

It was a great learning experience. While I'm used to MongoDB and Redis, this was my first time working with PostgreSQL, and I really enjoyed it. I’ve previously implemented socket communication in Go for blockchain transaction broadcasting, but when working in a team, you don’t always get to handle everything. This time, I got to be involved in every aspect from design decisions to end-to-end implementation which was rewarding. I've been working extensively with Next.js, Tailwind, and ShadCN, so revisiting React with Vite was a refreshing change.

### **1. What was my biggest challenge and how did I solve it?***

The reliability score calculation was a key challenge. Initially, I computed variance by fetching all historical records for each sensor, but as the dataset grew, this approach became a performance bottleneck.  
To solve this -  
- I Researched efficient variance calculation methods and found Welford’s Algorithm, which allows incremental updates without storing all past readings.  
- Introduced a `sensor_reliability` table to store precomputed statistics like mean, variance, and reliability score. Also add this `sensor_reliability` table is one of key technical decision I made, which paid off really well.
- Built a data pipeline that updates these statistics incrementally with each new reading, eliminating the need for full dataset scans.  
- Optimized the process to consider only the last few minutes, ensuring the reliability score reflects recent sensor performance rather than outdated data.


- Came up with a make-shift realibility scoring formula -  

Initial Formula - 
```
The expression `mean*frequency/variance` - ratio that combines three fundamental statistical measures:

Keeping latest for calculation - 
Mean - the average value of a dataset
Frequency - how often sensor data is fetched
Variance - how spread out the values are from the mean

A higher value suggests more reliable data. The ratio increases with higher mean values and frequencies, but decreases with higher variance which can be interpreted as noise.

Issues:
1. **Unbounded Values**  
   - The formula could produce values greater than 100%, making the reliability score meaningless.  

2. **Overweighting Mean and Frequency**  
   - Sensors with high frequency but high variance could still show high reliability, even if unstable.  

3. **Too Sensitive to Small Variance**  
   - When variance is small, the ratio becomes very large, exaggerating reliability.  

```
### Updated Formula - 

```
Reliability = 1 - (newVariance / (newVariance + newMean + 0.01))

### Explanation of the Formula
The fraction  
newVariance / (newVariance + newMean + 0.01)
represents how much variance contributes relative to the overall data spread.

```
- Higher variance → Higher fraction → Lower reliability  
- Lower variance → Lower fraction → Higher reliability  
- Subtracting from 1 ensures the result is between 0 and 1 (0–100%).  

### Result
- If variance is very small, the fraction approaches 0, so reliability approaches 1 (100%).  
- If variance is large, the fraction approaches 1, so reliability approaches 0 (0%).  
- The `0.01` in the denominator prevents division errors when variance is near zero.

This approach significantly improved reliability, but still there are improvements that can be made.

### What would I improve with more time?
With additional time, I would focus on:

- WebSocket subscription - Currently, users can only subscribe to specific sensors, but the system sends only the most reliable sensor data. I'd modify the server to allow users to view data from any sensor regardless of reliability, with clear visual indicators of data quality.
- Adaptive reliability calculation - I'd implement a more sophisticated algorithm that considers environmental factors and sensor types when calculating reliability scores, rather than using a single formula for all sensors. Also the current formula is heavily dominant towards variance, so a better way would be to go with normalization or add count weight or going with a penalty reward system to dampen the variance dominance.
- Caching layer - Implementing Redis to cache frequently accessed sensor data would further improve performance and reduce database load.
- UI improvements - Creating a more intuitive sensor selection interface and adding data visualization options to better represent sensor relationships and trends over time.

### Explain one key technical decision you made

I chose PostgreSQL over MySQL to ensure the project could scale effectively. PostgreSQL handles complex queries better as data volume grows, which was important for our sensor data analytics.  

This would allow to scale up and also give more optionalities in following areas -   
- **Advanced indexing** for faster time-series data retrieval.  
- **Better JSON support**, making it easier to adapt as sensor data changes.  
- **Strong transaction management**, ensuring data integrity with frequent sensor updates.  
- **Built-in statistical functions**, which would help with reliability score calculations.  

This decision made our database to handle future sensor deployments smoothly.