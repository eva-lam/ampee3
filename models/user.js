'use strict';
module.exports = (sequelize, DataTypes) => {
  var user = sequelize.define('user', {
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    SF_Client_ID: DataTypes.STRING,
    SF_access_token: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return user;
};