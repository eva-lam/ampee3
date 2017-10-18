'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('ytlists', 'DJ_room', {
        type: Sequelize.STRING
      })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('ytlists','DJ_room');
  }
};