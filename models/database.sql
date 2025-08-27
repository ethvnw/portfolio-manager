
CREATE SCHEMA portfolio_manager;

-- user table 
CREATE TABLE portfolio_manager.users (
	id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_pass CHAR(32) NOT NULL
);
-- portfolio table
CREATE TABLE portfolio_manager.portfolio (
	id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES portfolio_manager.users(id)
);

-- assets
CREATE TABLE portfolio_manager.assets (
	id INT AUTO_INCREMENT PRIMARY KEY,
    portfolio_id INT NOT NULL,
    ticker VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    buy_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolio_manager.portfolio(id)
);
-- transactions
CREATE TABLE portfolio_manager.transactions (
	id INT AUTO_INCREMENT PRIMARY KEY,
    portfolio_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    ticker VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    type ENUM('buy', 'sell') NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolio_manager.portfolio(id)
);