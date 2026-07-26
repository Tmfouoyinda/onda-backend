'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   
    await queryInterface.addConstraint('conversation_participants', {
      fields: ['last_read_message_id'],
      type: 'foreign key',
      name: 'fk_last_read_message_id',
      references: {
        table: 'messages',
        field: 'id'
      },
    });
  },

  async down (queryInterface, Sequelize) {
    

    await queryInterface.removeConstraint('conversation_participants', 'fk_last_read_message_id');
  }
};
