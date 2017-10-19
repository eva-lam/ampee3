<<<<<<< HEAD
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
||||||| merged common ancestors
=======
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
>>>>>>> d31f022c3c89a2fca1fb78c0db5d34d828bd1411
