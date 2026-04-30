# Worklog

---
Task ID: backend-setup
Agent: main
Task: Set up and run the Java backend (app-java-v3)

Work Log:
- Cloned backend repo from https://github.com/waelhe/app-java-v3
- Downloaded and extracted PostgreSQL 17 server + client debs into user space (/home/z/.local/opt/pg-extract/)
- Downloaded and extracted Redis 8 server + tools debs into user space (/home/z/.local/opt/redis-extract/)
- Downloaded and extracted liblzf1 shared lib for Redis
- Downloaded and extracted OpenJDK 21 JDK headless + JRE headless into user space (/home/z/.local/opt/jdk-extract/)
- Initialized PostgreSQL database at /home/z/.local/pgdata
- Created marketplace database and user
- Built the Java backend using Maven wrapper (./mvnw) with JAVA_HOME pointing to extracted JDK
- Updated R__seed_oauth2_client.sql to include http://localhost:3000/auth/callback redirect URI
- Started the backend with dev profile, empty keystore path (auto-generates RSA keys), simple cache, memory Quartz
- Created watchdog script at /home/z/.local/watchdog.sh for auto-restart

Stage Summary:
- PostgreSQL running on port 5432 (user-space install)
- Redis running on port 6379 (user-space install)
- Java backend running on port 8080 (Spring Boot 4.0.6 with Spring Modulith)
- All 14 Flyway migrations applied successfully
- Backend API returns 401 for protected endpoints (correct - requires JWT auth)
- Next.js proxy at /api/v1/listings correctly forwards to backend (returns 401)
- Backend process may be killed by sandbox; watchdog script available for restart
- Key env vars: BACKEND_URL=http://localhost:8080, NEXT_PUBLIC_AUTH_CLIENT_ID=marketplace-web-client
