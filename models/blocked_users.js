module.exports = (sequelize, DataTypes) => {
    const blocked_user = sequelize.define('blocked_user', {
        id : {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },

        blocker_id : {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },

        blocked_id : {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },

        created_at : {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },

    }, {
        underscored: true,
        updatedAt: false,
        indexes: [
            {
                unique: true,
                fields: ['blocker_id', 'blocked_id']
            }
        ]
    });
    return blocked_user;
};