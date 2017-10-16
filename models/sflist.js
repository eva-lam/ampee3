'use strict';
module.exports = (sequelize, DataTypes) => {
  var sflist = sequelize.define('sflist', {
    SF_playlist_id: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return sflist;
};