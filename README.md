# Transactions API

![Node.js](https://img.shields.io/badge/Node.js-333333?style=flat&logo=nodedotjs&logoColor=white)
![Kafka](https://img.shields.io/badge/Kafka-000000?style=flat&logo=apachekafka&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)

Welcome to my API attempt. This project is designed to demonstrate my approach to handling concurrency, throughput, and scalability in a real-world application. The API is built using **Node.js**, **Kafka**, and **MongoDB** and focuses on banking operations like deposits, withdrawal requests, and actual withdrawals.

## Table of Contents

- [Components Overview](#components-overview)
- [Thought Process](#thought-process)
- [Key Considerations](#key-considerations)
- [Performance Testing](#performance-testing)
- [Getting Started](#getting-started)
- [Conclusion](#conclusion)
- [License](#license)

---

## Components Overview

### **API Layer**
The API, located in the `api` folder, serves as the main entry point for clients. It manages banking transactions, processes incoming requests, and communicates with Kafka and MongoDB. 
- **Why this design?**: The API layer is crucial for decoupling the front-end and back-end, allowing for easier management of requests and better organization of business logic.

### **Producer and Consumer**
The `producer` and `consumer` directories contain the logic for interacting with Kafka. 
- The **producer** sends messages about transactions.
- The **consumer** listens for and processes those messages, ensuring smooth handling of incoming data.
- **Why this design?**: This separation allows for independent scaling of the producer and consumer components, which is essential for maintaining performance during peak loads.

### **NGINX Configuration**
The NGINX configuration in the `nginx` folder acts as a reverse proxy, routing incoming requests to the API service. 
- **Why this design?**: NGINX enhances security and load distribution. It protects the API from direct exposure to the internet and allows for better management of incoming traffic, which is important for maintaining responsiveness.

### **Docker and Docker Compose**
This project is **Dockerized**, making it easy to deploy and scale. The `docker-compose.yml` file allows for running multiple services in a containerized environment.
- **Why this design?**: Docker simplifies the setup process and ensures that the environment is consistent across different machines. This reduces "it works on my machine" issues and facilitates easier scaling of services.

### **Utility Scripts**
Scripts in the `scripts` directory provide functions for managing Kafka topics and testing the system.
- **Why this design?**: These utility scripts automate common tasks, which streamlines development and operational processes. They allow for quicker iterations during development and make it easier to manage the system in production.

---

## Thought Process

In developing this API, I prioritized addressing key challenges related to concurrency, throughput, and scalability:

- **Concurrency**: I implemented a producer-consumer model that allows multiple instances of the producer to send transaction messages concurrently. This decoupling helps manage the load effectively while maintaining responsiveness.
- **Why this choice?**: This approach leverages Kafka's strengths as a message broker, allowing multiple producers to work simultaneously without impacting performance. It makes the system more robust and capable of handling varying loads.

- **Throughput**: By utilizing Kafka as a message broker, I ensured that the system can handle a high volume of transactions without blocking. The non-blocking I/O capabilities of Node.js enable the API to process multiple requests simultaneously, which is critical for maintaining high throughput.
- **Why this choice?**: High throughput is essential for a banking API, as it needs to process many transactions in real time. By focusing on this aspect, I aimed to ensure the system can handle peak loads without degradation in performance.

- **Scalability**: The architecture is designed to support horizontal scaling. By deploying multiple instances of the producer and consumer, the system can adapt to varying loads efficiently. 
- **Why this choice?**: Horizontal scaling is a cost-effective way to manage increased load. It allows the system to handle traffic spikes without over-provisioning resources, which is particularly important in a cloud environment.

---

## Key Considerations

- **Data Integrity**: It's essential to ensure that all banking operations maintain data integrity. The API implements checks to prevent issues like overdrafts and ensures that all transactions adhere to business rules.
- **Why this choice?**: Maintaining data integrity is critical in financial applications. Ensuring that all transactions are valid and consistent protects against potential financial losses and maintains user trust.

- **Load Balancing**: The use of NGINX as a reverse proxy helps distribute incoming requests evenly across multiple API instances, preventing any single instance from becoming a bottleneck.
- **Why this choice?**: Load balancing is crucial for performance and reliability. It enhances the system's ability to handle traffic spikes and improves overall user experience by ensuring requests are handled promptly.

- **Testing and Monitoring**: Implementing robust testing and monitoring strategies is vital to identify potential issues with concurrency and performance. This includes stress testing with tools like **ApacheBench** to assess how the system behaves under load.
- **Why this choice?**: Continuous testing and monitoring allow for proactive identification of bottlenecks and performance issues. This helps maintain system reliability and ensures that any issues can be addressed quickly.

---

## Performance Testing

To evaluate the API's performance, I ran this benchmarking test using **ApacheBench** (ab):

```bash
ab -n 1000 -c 150 -p post-data.json -T "application/json" http://localhost:80/transaction
```

This test simulated a high volume of requests to ensure that the API can handle real-world scenarios effectively.
