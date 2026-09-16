module.exports = (sequelize, DataTypes) => {
    const conversation_participant = sequelize.define('conversation_participant', {
        id : {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },

        conversation_id : {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'conversations',
                key: 'id'
            }
        },

        user_id : {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },

        role : {
            type: DataTypes.ENUM('admin', 'member'),
            allowNull: false,
            defaultValue: 'member'
        },

        last_read_message_id : {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: 'messages',
                key: 'id'
            }
        },

        joined_at : {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },

        left_at : {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null
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
                fields: ['conversation_id', 'user_id']
            }
        ]
    });

    conversation_participant.associate = (models) => {
        conversation_participant.belongsTo(models.conversation, {
            foreignKey: 'conversation_id',
        });
    };

    return conversation_participant;
};