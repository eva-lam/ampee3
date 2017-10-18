'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('rooms','number', {
        type: Sequelize.STRING
      })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.createColumn('rooms','number');
  }
};