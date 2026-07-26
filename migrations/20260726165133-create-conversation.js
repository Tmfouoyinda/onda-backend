'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.createTable('conversations',

      { 
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
        },

        public_id: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true
        },

        type: {
          type: Sequelize.ENUM('direct', 'group'),
          allowNull: false
        },

        title: {
          type: Sequelize.STRING,
          allowNull: true
        },

        avatar_url: {
          type: Sequelize.STRING,
          allowNull: true
        },

        created_by: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
        },

        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },

        updated_at: {
          type: Sequelize.DATE,
          allowNull: true
        }

    });

  },

  async down (queryInterface, Sequelize) {
    
    await queryInterface.dropTable('conversations');
  }
};
