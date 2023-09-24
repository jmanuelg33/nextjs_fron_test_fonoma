FROM node:16.14.0

WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm install

COPY . /app/

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
