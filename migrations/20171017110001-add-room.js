'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('rooms', 'DJ_room', {
        type: Sequelize.STRING
      })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('rooms','DJ_room');
  }
};