
CREATE DATABASE IF NOT EXISTS notesdatabase;

USE notesdatabase;

CREATE TABLE IF NOT EXISTS entries (
    id varchar(36) PRIMARY KEY,
    userid Int(36),
    words varchar(255),
    rowPosition Int(255) NOT NULL,
    style VARCHAR(100)
);
