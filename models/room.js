'use strict';
module.exports = (sequelize, DataTypes) => {
  var room = sequelize.define('room', {
    number: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return room;
};