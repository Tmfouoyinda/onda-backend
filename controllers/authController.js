//AuthControllers
const {sequelize, verification_code, user, refresh_token } = require('../models');
const { Vonage } = require('@vonage/server-sdk');
const { Auth } = require('@vonage/auth');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { jwtSecret } = require('../config/env');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middlewares/authMiddleware');

const sendCode = async (req, res) => {
    const { phone_number } = req.body;

    if (!phone_number) {
        return res.status(400).json({
            status: 'error',
            message: 'Phone number is required'
        });
    }

    const normalizedPhone = phone_number.startsWith('+')
        ? phone_number
        : `+${phone_number.replace(/\D/g, '')}`;

    const code = crypto.randomInt(100000, 1000000).toString();
    const code_hash = crypto.createHash('sha256').update(code).digest('hex');
    const expires_at = new Date(Date.now() + 5 * 60 * 1000);

    const [{ lock_status }] = await sequelize.query('SELECT GET_LOCK(?, ?) AS lock_status;', {
        replacements: [`lock_${normalizedPhone}`, 10],
        type: sequelize.QueryTypes.SELECT
    });

    if (lock_status !== 1) {
        return res.status(429).json({
            status: 'error',
            message: 'A code was already requested for this number, please try again shortly'
        });
    }

    const vonage = new Vonage(new Auth({
        apiKey: process.env.VONAGE_API_KEY,
        apiSecret: process.env.VONAGE_API_SECRET,
    }));

    const transaction = await sequelize.transaction();
    let releaseLock = true;

    try {
        await verification_code.update({ consumed_at: new Date() }, {
            where: {
                phone_number: normalizedPhone,
                consumed_at: null
            },
            transaction
        });

        await verification_code.create({
            phone_number: normalizedPhone,
            code_hash: code_hash,
            expires_at: expires_at,
            consumed_at: null,
            purpose: 'registration'
        }, { transaction });

        await transaction.commit();
    } catch (error) {
        releaseLock = false;
        await transaction.rollback();

        return res.status(500).json({
            status: 'error',
            message: 'Failed to send code'
        });
    } finally {
        if (releaseLock) {
            await sequelize.query('SELECT RELEASE_LOCK(?);', {
                replacements: [`lock_${normalizedPhone}`],
                type: sequelize.QueryTypes.SELECT
            });
        }
    }

    try {
        const result = await vonage.sms.send({
            to: normalizedPhone,
            from: process.env.VONAGE_SMS_FROM || 'Vonage APIs',
            text: `Votre code de vérification Onda est : ${code}`
        });
    } catch (error) {
        console.error('Failed to send verification SMS:', JSON.stringify(error.response || error, null, 2));
    }

    console.log(`Verification code for ${normalizedPhone}: ${code}`);

    return res.json({
        status: 'success',
        message: 'Code sent successfully'
    });
}


const verifyCode = async (req, res ) => {
    const {phone_number, code} = req.body;

    const code_hash = crypto.createHash('sha256').update(code).digest('hex');

    const record = await verification_code.findOne({
        where: {
            code_hash: code_hash,
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

    const [ userRecord, created ] = await user.findOrCreate({
        where: { phone_number: phone_number },
        defaults: { phone_number: phone_number }
    });

    const token = jwt.sign({ id: userRecord.id }, jwtSecret, { expiresIn: '1h' });


    const tokenToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(tokenToken).digest('hex');

    await refresh_token.create({
        user_id: userRecord.id,
        token_hash: refreshTokenHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    res.json({
        status: "success",
        message: "Code verified successfully",
        token: token,
        refreshToken: tokenToken
    });

};

const logout = async (req, res) => {
    const { refreshToken } = req.body;

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await refresh_token.update({revoked_at: new Date()}, {
        where: { token_hash: refreshTokenHash }
    });

    res.json({
        status: "success",
        message: "Logged out successfully"
    });
};


const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const recordRefreshToken = await refresh_token.findOne({
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

    const newTokenToken = crypto.randomBytes(64).toString('hex');
    const newRefreshTokenHash = crypto.createHash('sha256').update(newTokenToken).digest('hex');

    await recordRefreshToken.update({ revoked_at: new Date() });

    await refresh_token.create({
        user_id: recordRefreshToken.user_id,
        token_hash: newRefreshTokenHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    res.json({
        status: "success",
        message: "Token refreshed successfully",
        token: newAccessToken,
        refreshToken: newTokenToken
    });
};


const me = async (req, res) => {

    const userId = req.user.id;

    const userRecord = await user.findByPk(userId);

    if (!userRecord) {
        return res.status(404).json({
            status: "error",
            message: "User not found"
        });
    }

    res.json({
        status: "success",
        data: {
            id: userRecord.id,
            phone_number: userRecord.phone_number,
            display_name: userRecord.display_name,
            created_at: userRecord.created_at,
            updated_at: userRecord.updated_at,
            username: userRecord.username,
            avatar_url: userRecord.avatar_url
        }
    });


}


const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { username, avatar_url, bio, display_name } = req.body;

    const userRecord = await user.findByPk(userId);

    if (!userRecord) {
        return res.status(404).json({
            status: "error",
            message: "User not found"
        });
    }

    try {
        userRecord.avatar_url = avatar_url || userRecord.avatar_url;
        userRecord.username = username || userRecord.username;
        userRecord.display_name = display_name || userRecord.display_name
        userRecord.bio = bio || userRecord.bio;

        await userRecord.save();

        res.json({
            status: "success",
            message: "Profile updated successfully",
        });
       
    } catch (error) {

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                status: "error",
                message: error.errors.map(e => e.message).join(', ')
            });
        }

        res.status(500).json({
            status: "error",
            message: "Failed to update profile"
        });
    }

    
}

module.exports = {
    sendCode,
    verifyCode,
    logout,
    refreshToken,
    me,
    updateProfile
}