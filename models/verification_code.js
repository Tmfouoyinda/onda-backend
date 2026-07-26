module.exports = (sequelize, DataTypes) => {
    const verificationCode = sequelize.define('verification_code', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },

        phone_number: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        code_hash: {
            type: DataTypes.STRING,
            allowNull: false
        },

        attempts: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        purpose: {
            type: DataTypes.ENUM('registration', 'login', 'change_phone'),
            allowNull: false
        },

        expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        },

        consumed_at: {
            type: DataTypes.DATE,
            allowNull: true
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        
    }, {
        underscored: true,
        updatedAt: false,
    });
    return verificationCode;
};