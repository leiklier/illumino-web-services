require('dotenv').config()
global.chai = require('chai')
global.expect = global.chai.expect
global.should = global.chai.should

global.db = require('./test-utils').db
