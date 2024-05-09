FROM node:20

WORKDIR /src

COPY . .

EXPOSE 3000

RUN rm -rf node_modules

RUN npm i

CMD ["npm", "build"]

CMD ["npm", "start"]
