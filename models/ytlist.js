'use strict';
module.exports = (sequelize, DataTypes) => {
  var ytlist = sequelize.define('ytlist', {
    YT_video_id: DataTypes.STRING,
    YT_title: DataTypes.STRING,
    YT_video_thumbnailurl: DataTypes.STRING,
    YT_video_duration: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return ytlist;
};