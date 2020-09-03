//see package.json
//"test": "mocha --require test/setup.js",

//to avoid needing to require expect
//and supertest in every file
//and to be able to add these functions
//as globals inside tests

process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRY = '3m';

require('dotenv').config();

const { expect } = require('chai');
const supertest = require('supertest');

global.expect = expect;
global.supertest = supertest;


