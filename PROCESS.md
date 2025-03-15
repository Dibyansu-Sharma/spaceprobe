# Log 02:09 AM 15.03.2025  

## Goal - Create a Weather Check Application 
First and foremost keep a cool name - SpaceProbe 
Create a simple application that:  
- Generates mock sensor data (temperature, AQI, occupancy, etc.).  adding humidity, pressure, timestamp, visibility and  reliability_score
- Collects this data through a TCP server.  
- Stores readings in PostgreSQL.  
- Pushes real-time updates through WebSockets.  
- Displays the data on a React dashboard with basic visualization.  

## Starting with Backend  

1. **Go was mandatory**, no second thoughts.  
2. **PostgreSQL over MySQL** – PostgreSQL scales better for complex queries as data grows, plus a good time to learn it.  
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

# Log 18:31 AM 15.03.2025  

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