FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p uploads && chmod 755 uploads
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001
RUN chown -R nodeuser:nodejs /app
USER nodeuser
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
CMD ["npm", "start"]