-- Dummy data for users
INSERT INTO portfolio_manager.users (email, hashed_pass) VALUES
	('alice@example.com', 'e99a18c428cb38d5f260853678922e03'),
	('bob@example.com', '5f4dcc3b5aa765d61d8327deb882cf99'),
	('carol@example.com', '098f6bcd4621d373cade4e832627b4f6');

-- Dummy data for assets
INSERT INTO portfolio_manager.assets (user_id, ticker, name, category, quantity, buy_price, current_price, currency, type)
VALUES
	(1, 'AAPL', 'Apple Inc.', 'stocks', 10.00, 150.00, 180.00, 'USD', 'keep'),
	(1, 'TSLA', 'Tesla Inc.', 'stocks', 5.00, 700.00, 900.00, 'USD', 'keep'),
	(2, 'AMZN', 'Amazon.com Inc.', 'stocks', 2.00, 3200.00, 3500.00, 'USD', 'buy'),
	(2, 'C', 'Citigroup Inc.', 'stocks', 20.00, 60.00, 65.00, 'USD', 'sell'),
	(3, 'FB', 'Meta Platforms Inc.', 'stocks', 8.00, 250.00, 270.00, 'USD', 'keep'),
	(3, 'USD', 'US Dollar', 'cash', 1000.00, 1.00, 1.00, 'USD', 'keep'),
	(1, 'BTC', 'Bitcoin', 'crypto', 0.5, 30000.00, 40000.00, 'USD', 'keep');