'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   
    await queryInterface.createTable('verification_codes', { 

      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },

      phone_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      code_hash: {
        type: Sequelize.STRING,
        allowNull: false
      },

      attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      purpose: {
        type: Sequelize.ENUM('registration', 'login', 'change_phone'),
        allowNull: false
      },

      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },

      consumed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
     });

  },

  async down (queryInterface, Sequelize) {
    
    await queryInterface.dropTable('verification_codes');

  }
};
