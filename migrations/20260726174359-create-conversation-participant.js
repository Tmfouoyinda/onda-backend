'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.createTable('conversation_participants', 
      {
        id : {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
        },

        conversation_id : {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'conversations',
            key: 'id'
          }
        },

        user_id : {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },

        role : {
          type: Sequelize.ENUM('admin', 'member'),
          allowNull: false,
          defaultValue: 'member'
        },

        last_read_message_id : {
          type: Sequelize.BIGINT,
          allowNull: true,
        },

        joined_at : {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },

        left_at : {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null
        },

        created_at : {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
      }
    );

    await queryInterface.addIndex('conversation_participants', ['conversation_id', 'user_id'], {
      unique: true,
      name : 'conversation_participants_conversation_id_user_id_unique'
    })
  }, 

  async down (queryInterface, Sequelize) {

    await queryInterface.dropTable('conversation_participants');

  }

};
