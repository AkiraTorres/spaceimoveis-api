FROM node

WORKDIR /src

COPY . .

EXPOSE 3000

RUN rm -rf node_modules

RUN npm i

CMD ["npm", "start"]
