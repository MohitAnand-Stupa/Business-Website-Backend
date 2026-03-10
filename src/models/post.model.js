const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Post = sequelize.define("Post", {
  platform: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  post_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  caption: {
    type: DataTypes.TEXT,
  },
  media_url: {
    type: DataTypes.TEXT,
  },
  permalink: {
    type: DataTypes.TEXT,
  },
  media_type: {
    type: DataTypes.STRING,
  },
  timestamp: {
    type: DataTypes.DATE,
  },
});

module.exports = Post;
