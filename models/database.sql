
CREATE SCHEMA portfolio_manager;

-- user table 
CREATE TABLE portfolio_manager.users (
	id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_pass CHAR(32) NOT NULL
);


-- assets
CREATE TABLE portfolio_manager.assets (
	id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ticker VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    buy_price DECIMAL(10, 2) NOT NULL,
    current_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type ENUM('buy', 'sell', 'keep') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES portfolio_manager.users(id)
);
