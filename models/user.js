module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {

    id: {
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

    
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    phone_verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },

    username: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },

    display_name: {
      type: DataTypes.STRING,
      allowNull: true
    },

    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true
    },

    last_seen_at: {
      type: DataTypes.DATE,
      allowNull: true
    },

    status: {
      type: DataTypes.ENUM('active', 'suspended', 'deleted'),
      defaultValue: 'active'
    },

    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },

  }, {
    underscored: true
  });
  return User;
};