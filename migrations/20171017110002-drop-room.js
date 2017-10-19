<<<<<<< HEAD
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
||||||| merged common ancestors
=======
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
>>>>>>> d31f022c3c89a2fca1fb78c0db5d34d828bd1411
