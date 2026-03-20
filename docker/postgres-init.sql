-- Evolution API connects as user "user" (hardcoded in its internal .env)
CREATE ROLE "user" WITH SUPERUSER LOGIN PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE evolution TO "user";
