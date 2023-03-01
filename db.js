const {Sequelize} = require("sequelize");

module.exports = new Sequelize(
	'jsTest2',
	'doadmin',
	'AVNS_TwR5WDa6Tl4X0ydCPG3',
	 {
	   host: 'db-postgresql-ams3-86599-do-user-13571195-0.b.db.ondigitalocean.com',
	   port: '25061',
	   dialect: 'postgres',
	   dialectOptions: {
		   ssl: {
			 require: true,
			 rejectUnauthorized: false
		   }
	   }
	 }
)