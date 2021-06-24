-- both test users have the password "password"

INSERT INTO users (username, password, first_name, last_name, email)
VALUES ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User',
        'Ciro16@gmail.com'
        ),
       ('test2user2',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test2',
        'User2',
        'Ciro16@gmail.com'
        );

INSERT INTO companies (name, url, address, lat, lng, username)
VALUES ('Saiko Sushi Coronado',
        'http://saikosushisd.com/',
        '116 Orange Ave, Coronado CA, 92118',
        32.6987, 
        -117.173,
        'testuser'
        ),
       ('The Fishery',
        'https://www.thefishery.com/',
        '5040 Cass St, San Diego CA, 92118',
        32.80069,
        -117.2547,
        'test2user2'
        );

INSERT INTO jobs (position, hourly_pay, date, company_id)
VALUES ('Prep Cook',
        14,
        '2021-06-22',
        1),
        ('Dishwasher',
        14,
        '2021-06-22',
        1),
        ('Line Cook',
        16,
        '2021-06-22',
        2);
