module.exports = (sequelize, DataTypes) => {

    const conversation = sequelize.define('conversation', {
        
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },

        public_id: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true
        },

        type: {
            type: DataTypes.ENUM('direct', 'group'),
            allowNull: false
        },

        title: {
            type: DataTypes.STRING,
            allowNull: true
        },

        avatar_url: {
            type: DataTypes.STRING,
            allowNull: true
        },

        created_by: {
            type: DataTypes.BIGINT,
            allowNull: false
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },

        updated_at: {
            type: DataTypes.DATE,
            allowNull: true
        },

    }, {
        underscored: true,
    });
    return conversation;
};