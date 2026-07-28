'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   
    await queryInterface.createTable('refresh_tokens', 
      {
        id : {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
        }, 

        user_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },

        token_hash: {
          type: Sequelize.STRING,
          allowNull: false
        },

        expires_at: {
          type: Sequelize.DATE,
          allowNull: false
        },

        revoked_at: {
          type: Sequelize.DATE,
          allowNull: true
        },

        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
      }
    );
  },

  async down (queryInterface, Sequelize) {
    
    await queryInterface.dropTable('refresh_tokens');

  }
};
