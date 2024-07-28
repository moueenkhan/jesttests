FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install --ignore-optional

# Bundle app source
COPY . .

# Command to run tests
CMD ["npm", "test"]
