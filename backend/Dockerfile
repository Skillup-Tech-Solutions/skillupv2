FROM node:18-alpine
WORKDIR /app

# Environment variables (set these at runtime or in docker-compose)
ENV NODE_ENV=production
ENV PORT=5000

# MongoDB
ENV MONGO_URI=""

# JWT Authentication
ENV JWT_SECRET=""

# Frontend URL (for CORS and email links)
ENV FRONTEND_URL=""
ENV APP_API_URL=""

# Admin Configuration
ENV ADMIN_EMAIL=""

# Mailjet Email Configuration
ENV from_email=""
ENV EMAIL_USER=""
ENV API_KEY=""
ENV SECRET_KEY=""

# Backblaze B2 Storage
ENV keyID=""
ENV applicationKey=""
ENV B2_BUCKET_NAME=""

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