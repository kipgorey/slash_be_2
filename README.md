
# Node Kafka Producer Consumer API

![Node.js](https://img.shields.io/badge/Node.js-333333?style=flat&logo=nodedotjs&logoColor=white)
![Kafka](https://img.shields.io/badge/Kafka-000000?style=flat&logo=apachekafka&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)

Welcome to my API attempt. This is designed to demonstrate my approach to handling concurrency, throughput, and scalability in a real-world application. The API is built using **Node.js**, **Kafka**, and **MongoDB** and focuses on banking operations like deposits, withdrawal requests, and actual withdrawals.

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
The API, located in the `api` folder, is the main entry point for clients. It manages banking transactions, processes incoming requests, and communicates with Kafka and MongoDB. The API uses RESTful endpoints to provide a clear and efficient way for clients to interact with the banking services.

### **Producer and Consumer**
The `producer` and `consumer` directories contain the logic for interacting with Kafka. 
- The **producer** sends messages about transactions. It batches these messages to optimize performance, ensuring that multiple messages can be sent in one go. This approach reduces the overhead associated with individual message sends.
- The **consumer** listens for and processes those messages. It acknowledges messages once they have been successfully processed, allowing for reliable handling of data even in the event of failures.

### **NGINX Configuration**
The NGINX configuration in the `nginx` folder acts as a reverse proxy, routing incoming requests to the API service. This setup enhances security by hiding the API's internal structure and helps balance the load across multiple API instances, ensuring no single instance is overwhelmed.

### **Docker and Docker Compose**
This project is **Dockerized**, making it easy to deploy and scale. The `docker-compose.yml` file allows for running multiple services in a containerized environment, simplifying dependency and configuration management. Each service can be scaled independently based on demand, allowing for efficient resource use.

### **Utility Scripts**
Scripts in the `scripts` directory provide functions for managing Kafka topics and testing the system, helping streamline both development and operational tasks. These scripts can create or delete topics as needed, ensuring that the system remains flexible and can adapt to changing requirements.

---

## Thought Process

In developing this API, I prioritized addressing key challenges related to concurrency, throughput, and scalability:

- **Concurrency**: To manage multiple requests simultaneously, I implemented a producer-consumer model. This architecture allows multiple instances of the producer to send transaction messages concurrently, enabling the API to handle high loads without degrading performance. Each producer instance can operate independently, increasing the overall capacity of the system.

- **Throughput**: Leveraging Kafka as a message broker allows the system to handle a high volume of transactions without blocking. Kafka's distributed architecture provides resilience and scalability, enabling it to handle a large number of messages per second. By using non-blocking I/O capabilities of Node.js, the API can process multiple requests simultaneously, maximizing throughput.

- **Scalability**: The architecture supports horizontal scaling, allowing multiple instances of both producers and consumers to run in parallel. This design enables the system to adapt to varying loads effectively. During peak transaction times, additional instances can be spun up to maintain performance without downtime.

---

## Key Considerations

- **Data Integrity**: Ensuring data integrity is crucial in banking applications. The API implements various checks and balances to prevent issues like overdrafts. Each transaction is validated against current account balances and other business rules before being processed. This guarantees that operations are conducted accurately and reliably.

- **Load Balancing**: Using NGINX as a reverse proxy not only enhances security but also helps in load balancing. By distributing incoming requests evenly across multiple API instances, it prevents any single instance from becoming a bottleneck, thus improving the overall responsiveness of the application.

- **Testing and Monitoring**: Robust testing and monitoring strategies are vital for identifying potential issues with concurrency and performance. This includes stress testing with tools like **ApacheBench** to simulate high loads and analyze how the system behaves under stress. Continuous monitoring can help identify bottlenecks and optimize performance over time.

---

## Performance Testing

To evaluate the API's performance, I ran a benchmarking test using **ApacheBench** (ab):

```bash
ab -n 1000 -c 150 -p post-data.json -T "application/json" http://localhost:80/transaction
```

This test simulates a high volume of requests to ensure that the API can handle real-world scenarios effectively. It measures key performance metrics such as response time and throughput, helping to identify any potential bottlenecks in the system.

---

## Getting Started

Instructions for setting up and running the project locally can be found in the [Getting Started](#getting-started) section.

---

## Conclusion

This project showcases my approach to solving concurrency, throughput, and scalability challenges in a real-time application. I hope it provides insight into my thought process and technical skills in building efficient, reliable systems.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
