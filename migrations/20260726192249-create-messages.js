'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   
    await queryInterface.createTable('messages', 
      {
        id : {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
        }, 

        public_id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          unique: true
        },

        conversation_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'conversations',
            key: 'id'
          }
        },

        sender_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },

        message_type: {
          type: Sequelize.ENUM('text','system'),
          allowNull: false
        },

        content: {
          type: Sequelize.TEXT,
          allowNull: true
        },

        reply_to_id: {
          type: Sequelize.BIGINT,
          allowNull: true,
          references: {
            model: 'messages',
            key: 'id'
          }
        },

        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true
        },

        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },

        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }
    )

    await queryInterface.addIndex('messages', ['conversation_id', 'id'], {
      name: 'messages_conversation_id_id_index'
    })
  },

  async down (queryInterface, Sequelize) {
    
    await queryInterface.dropTable('messages');
  }
};
