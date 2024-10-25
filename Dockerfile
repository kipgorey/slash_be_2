# Dockerfile
# Use the official Node.js image as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install


# Copy the rest of your application code
COPY . .

# Expose the API port
EXPOSE 5001

# Command to run the API
CMD ["node", "api/index.js"]
