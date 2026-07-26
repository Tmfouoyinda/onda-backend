module.exports = (sequelize, DataTypes) => {
    const message = sequelize.define('message', {
        id : {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },

        public_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            unique: true
        },

        conversation_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'conversations',
                key: 'id'
            }
        },

        sender_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },

        message_type: {
            type: DataTypes.ENUM('text','system'),
            allowNull: false
        },

        content: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        reply_to_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: 'messages',
                key: 'id'
            }
        },

        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },

        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }

    }, {
        underscored: true,
    });
    return message;
};