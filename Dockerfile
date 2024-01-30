FROM node:20.5-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Install the below packages globally
RUN npm install -g nodemon
RUN npm install -g ts-node
RUN npm install -g typescript

# Bundle app source
COPY . .

EXPOSE 3000

# Start your Node.js app
CMD [ "npm", "start" ]