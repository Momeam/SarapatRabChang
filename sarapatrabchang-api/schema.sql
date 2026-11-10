CREATE TABLE IF NOT EXISTS users (
  supabase_id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(320) NOT NULL,
  full_name VARCHAR(120) NOT NULL DEFAULT '',
  phone VARCHAR(30) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY users_email_unique (email)
);

CREATE TABLE IF NOT EXISTS bookings (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  provider_id VARCHAR(80) NOT NULL,
  package_title VARCHAR(120) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  service_date DATE NOT NULL,
  time_slot VARCHAR(60) NOT NULL,
  contact_name VARCHAR(120) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(30) NOT NULL DEFAULT '',
  address VARCHAR(500) NOT NULL,
  note VARCHAR(500) NOT NULL DEFAULT '',
  status ENUM('pending_payment', 'paid', 'in_progress', 'delivered', 'completed')
    NOT NULL DEFAULT 'pending_payment',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY bookings_user_id_created_at (user_id, created_at),
  CONSTRAINT bookings_user_id_fk
    FOREIGN KEY (user_id) REFERENCES users (supabase_id)
);
