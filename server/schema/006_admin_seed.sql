-- Seed admin user for initial setup.
-- INSERT OR IGNORE — idempotent: only creates if email doesn't exist.
-- Password hash for 'kalash1004' (bcrypt, 10 rounds).

INSERT OR IGNORE INTO admin_users (email, password_hash, name, created_at)
VALUES ('kalashnikova199979@mail.ru', '$2b$10$0eocW4UQ8ES9WPDn80pAY.fVS.W1Fk.1EIJaldJX8rIpn3O7A8Yse', 'Юлия', 1724419200000);
