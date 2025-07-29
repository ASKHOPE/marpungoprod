# Stage 1: Builder
FROM node:24.1.0 AS builder

WORKDIR /app
ENV NODE_ENV=production

# Accept build-time environment variables from docker-compose
ARG MONGODB_URI
ARG MONGODB_DB_NAME
ARG STRIPE_SECRET_KEY
ARG NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL
ARG NEXT_PUBLIC_STRIPE_GENERAL_DONATION_LINK
ARG NEXT_PUBLIC_APP_URL
ARG AUTH_SECRET

# Set ENV vars so they're available to `next build`
ENV MONGODB_URI=$MONGODB_URI
ENV MONGODB_DB_NAME=$MONGODB_DB_NAME
ENV STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
ENV NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL=$NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL
ENV NEXT_PUBLIC_STRIPE_GENERAL_DONATION_LINK=$NEXT_PUBLIC_STRIPE_GENERAL_DONATION_LINK
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV AUTH_SECRET=$AUTH_SECRET

# Install dependencies
COPY package.json .
COPY package-lock.json .
RUN npm ci

# Copy app source
COPY . .

# Build Next.js
RUN npm run build

# Stage 2: Runner
FROM node:24.1.0 AS runner

WORKDIR /app
ENV NODE_ENV=production

# Accept the same ARGs at runtime if needed (optional but good practice)
ARG MONGODB_URI
ARG MONGODB_DB_NAME
ARG STRIPE_SECRET_KEY
ARG NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL
ARG NEXT_PUBLIC_STRIPE_GENERAL_DONATION_LINK
ARG NEXT_PUBLIC_APP_URL
ARG AUTH_SECRET

ENV MONGODB_URI=$MONGODB_URI
ENV MONGODB_DB_NAME=$MONGODB_DB_NAME
ENV STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
ENV NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL=$NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL
ENV NEXT_PUBLIC_STRIPE_GENERAL_DONATION_LINK=$NEXT_PUBLIC_STRIPE_GENERAL_DONATION_LINK
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV AUTH_SECRET=$AUTH_SECRET

# Copy minimal files and build output
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public 

COPY --from=builder /app/next.config.ts ./next.config.ts


# Expose port and run app
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["npm", "start"]
