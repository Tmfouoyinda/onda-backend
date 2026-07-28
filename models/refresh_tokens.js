    module.exports = (sequelize, DataTypes) => {
        const refreshToken = sequelize.define('refresh_token', {
            id : {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true
            },
            
            user_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },

            token_hash: {
                type: DataTypes.STRING,
                allowNull: false
            },


            expires_at: {
                type: DataTypes.DATE,
                allowNull: false
            },

            revoked_at: {
                type: DataTypes.DATE,
                allowNull: true
            },


            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },

        },{
            underscored: true,
            updatedAt: false,
        });
        return refreshToken;
    }