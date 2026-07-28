//AuthControllers
const {sequelize, verification_code, User, RefreshToken } = require('../models');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { jwtSecret } = require('../config/env');
const jwt = require('jsonwebtoken');

const sendCode = async (req, res) => {

    const {phone_number} = req.body;
    
    const code = crypto.randomInt(100000, 1000000).toString();
    const code_hash = crypto.createHash('sha256').update(code).digest('hex');
    const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    await sequelize.query('SELECT GET_LOCK(?, ?) AS lock_status;', {
        replacements: [`lock_${phone_number}`, 10],
        type: sequelize.QueryTypes.SELECT
    });

    await verification_code.update({consumed_at: new Date()}, {
        where: {
            phone_number: phone_number,
            consumed_at: null
        }
    });

    await verification_code.create({
        phone_number: phone_number,
        code_hash: code_hash,
        expires_at: expires_at,
        consumed_at: null,
        purpose: 'registration'
    });

    await sequelize.query('SELECT RELEASE_LOCK(?);', {
        replacements: [`lock_${phone_number}`],
        type: sequelize.QueryTypes.SELECT
    });

    console.log(`Verification code for ${phone_number}: ${code}`);

    res.json({
        status: "success",
        message: "Code sent successfully"
    });
}


const verifyCode = async (req, res ) => {
    const {phone_number, code} = req.body;

    const code_hash = crypto.createHash('sha256').update(code).digest('hex');

    const record = await verification_code.findOne({
        where: {
            phone_number: phone_number,
            consumed_at: null,
            expires_at: {
                [Op.gt]: new Date()
            }
        }
    });

    if (!record) {
        return res.status(400).json({
            status: "error",
            message: "Invalid or expired code"
        });
    }

    await record.update({consumed_at: new Date()});

    const [ userRecord, created ] = await User.findOrCreate({
        where: { phone_number: phone_number },
        defaults: { phone_number: phone_number }
    });

    const token = jwt.sign({ id: userRecord.id }, jwtSecret, { expiresIn: '1h' });


    const tokenToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(tokenToken).digest('hex');

    const refreshToken = await RefreshToken.create({
        user_id: userRecord.id,
        token_hash: refreshTokenHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    res.json({
        status: "success",
        message: "Code verified successfully",
        token: token,
        refreshToken: refreshToken
    });

};

const logout = async (req, res) => {
    const { refreshToken } = req.body;

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await RefreshToken.update({revoked_at: new Date()}, {
        where: {
            token_hash: refreshTokenHash,
        }
    });

    res.json({
        status: "success",
        message: "Logged out successfully"
    });
};


const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const recordRefreshToken = await RefreshToken.findOne({
        where: {
            token_hash: refreshTokenHash,
            revoked_at: null,
            expires_at: {
                [Op.gt]: new Date()
            }
        }
    });


    if (!recordRefreshToken) {
        return res.status(400).json({
            status: "error",
            message: "Invalid or expired refresh token"
        });
    }

    const newAccessToken = jwt.sign({ id: recordRefreshToken.user_id }, jwtSecret, { expiresIn: '1h' });


    res.json({
        status: "success",
        message: "Token refreshed successfully",
        token: newAccessToken
    });
};

module.exports = {
    sendCode,
    verifyCode,
    logout,
    refreshToken
}