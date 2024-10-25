# Node Kafka Producer Consumer API

![Node.js](https://img.shields.io/badge/Node.js-333333?style=flat&logo=nodedotjs&logoColor=white)
![Kafka](https://img.shields.io/badge/Kafka-000000?style=flat&logo=apachekafka&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)

Welcome to the **Node Kafka Producer Consumer API**! This project implements a **scalable** and **high-throughput** API using **Node.js**, **Kafka**, and **MongoDB**. It supports banking operations such as deposits, withdrawal requests, and actual withdrawals. This API is designed to efficiently handle multiple concurrent requests while ensuring data integrity and reliability.

## Table of Contents

- [Components Overview](#components-overview)
- [Thought Process](#thought-process)
- [Key Features](#key-features)
- [Performance Testing](#performance-testing)
- [Getting Started](#getting-started)
- [Conclusion](#conclusion)
- [License](#license)

---

## Components Overview

### **API Layer**
The API, located in the `api` folder, is the main entry point for clients. It handles banking transactions, processes incoming requests, and communicates with Kafka and MongoDB.

### **Producer and Consumer**
The `producer` and `consumer` directories contain the logic for interacting with Kafka. 
- The **producer** sends messages related to transactions.
- The **consumer** listens for and processes those messages.

### **NGINX Configuration**
The NGINX configuration in the `nginx` folder serves as a reverse proxy, routing incoming requests to the API service. This setup provides an additional layer of abstraction and security.

### **Docker and Docker Compose**
The project is **Dockerized**, allowing for easy deployment and scalability. The `docker-compose.yml` file facilitates running multiple services in a containerized environment, making it easier to manage dependencies and configurations.

### **Utility Scripts**
Scripts in the `scripts` directory provide convenience functions for managing Kafka topics and testing the system. These scripts simplify common tasks, allowing for a smoother development and operational experience.

---

## Thought Process

The API was designed with scalability and performance in mind. Kafka serves as a **message broker** to decouple the API from the processing of transactions, allowing for **high throughput** and **asynchronous processing**. This architecture enables the application to handle a large number of simultaneous requests efficiently.

---

## Key Features

- ### **Scalability**
  The use of Kafka enables horizontal scaling. Multiple instances of the producer and consumer can run independently, enhancing throughput and allowing the application to adapt to varying load conditions.

- ### **High Throughput**
  The architecture efficiently handles a large number of concurrent requests without blocking, utilizing **non-blocking I/O** provided by Node.js. This design choice minimizes latency and maximizes the responsiveness of the API.

- ### **Data Integrity**
  The API logic ensures that banking operations maintain data integrity through appropriate checks (e.g., preventing overdrafts). It ensures that any transaction adheres to business rules, safeguarding the financial operations involved.

---

## Performance Testing

To assess the performance of the API, I ran a benchmarking test using **ApacheBench** (ab):

```bash
ab -n 1000 -c 150 -p post-data.json -T "application/json" http://localhost:80/transaction
