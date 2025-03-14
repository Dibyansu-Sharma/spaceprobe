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
