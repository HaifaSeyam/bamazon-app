drop DATABASE IF EXISTS bamazon_db;

CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products (
	id INTEGER NOT NULL AUTO_INCREMENT
    , product_name VARCHAR(100)
    , department_name VARCHAR(100)
    , price DECIMAL(10, 2)
    , stock_quantity INTEGER(11)
	, product_sales INTEGER(11)
    , PRIMARY KEY (id)
);

CREATE TABLE departments (
	id INTEGER NOT NULL AUTO_INCREMENT
	, department_id INTEGER(11)
    , department_name VARCHAR(100)
    , over_head_costs INTEGER(11)
    , PRIMARY KEY (id)
);

SELECT * FROM products;
SELECT * FROM departments;

