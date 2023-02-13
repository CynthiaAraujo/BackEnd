const sqliteConnection = require('../../sqlite');

const createUsers = require('./createUsers');

async function migrationsRun (){
  const schemas = [
    createUsers,

  ].join('/');

  try {
    const db = await sqliteConnection();
   
    db.exec(schemas)
  } catch(error){
    console.log(error)
  } 
  // sqliteConnection()
  // .then(db => db.exec(schemas))
  // .catch(error => console.log(error));

}

module.exports = migrationsRun;