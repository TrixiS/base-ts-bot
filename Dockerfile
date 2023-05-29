FROM alpine:3.18

RUN apk add --update --no-cache git npm

COPY . ./app

WORKDIR ./app

RUN npm install --omit=dev
RUN npx prisma db push
RUN npx tsc

CMD ["node", "bin/index.js"]
