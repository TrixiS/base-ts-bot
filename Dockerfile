FROM node:18-alpine3.18

COPY . ./app

WORKDIR ./app

RUN npm install --omit=dev
RUN npx prisma db push
RUN npx tsc

CMD ["node ./bin/index.js"]