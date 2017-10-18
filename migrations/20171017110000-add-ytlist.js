<<<<<<< HEAD
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
||||||| merged common ancestors
=======
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
>>>>>>> d31f022c3c89a2fca1fb78c0db5d34d828bd1411
