FROM node:8.10.0

ENV NODE_EXTRA_CA_CERTS=fullchain.pem
ENV NODE_ENV=production
COPY ${PWD} /node
WORKDIR /node
VOLUME /node

CMD ["node", "index.js"]
