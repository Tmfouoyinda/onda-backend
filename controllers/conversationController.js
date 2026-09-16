const { sequelize, user, conversation_participant, conversation } = require('../models');



const getConversations = async (req, res) => {
    const userId = req.user.id;

    try {
        const userConversations = await conversation.findAll({
            include: [{
            model: conversation_participant,
                where: { user_id: userId, left_at: null },
                attributes: [],
            }],
            order: [['updated_at', 'DESC'], ['created_at', 'DESC']],
        });
        res.json(userConversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


const createConversation = async (req, res) => {

    // Utilisateur A
    const userAId = req.user.id;

    // Utilisateur B
    const { userBId } = req.body;

    // Vérification de la présence de userBId
    if (!userBId) {
        return res.status(400).json({ error: 'userBId is required' });
    }

    // Meme utilisateur
    if (String(userAId) === String(userBId)) {
        return res.status(400).json({ error: 'Vous ne pouvez pas créer une conversation avec vous-même' });
    }

    try {
        // Vérifier que l'utilisateur B existe
        const userB = await user.findByPk(userBId);

        if (!userB) {
            return res.status(404).json({ error: 'Utilisateur B non trouvé' });
        }

        // Vérifier si une conversation directe existe déjà entre les deux utilisateurs
        const existingConversation = await conversation.findOne({
            where: { type: 'direct' },
            include: [{
                model: conversation_participant,
                where: { user_id: [userAId, userBId], left_at: null },
                attributes: [],
            }],
            group: ['conversation.id'],
            having: sequelize.where(sequelize.fn('COUNT', sequelize.col('conversation_participant.user_id')), 2)
        });

        if (existingConversation) {
            return res.status(400).json({ error: 'Une conversation directe existe déjà entre ces deux utilisateurs' });
        }

        // Créer la nouvelle conversation
        const newConversation = await conversation.create({
            type: 'direct',
            created_by: userAId,
        });

        // Ajouter les participants à la conversation
        await conversation_participant.create({ user_id: userAId, conversation_id: newConversation.id });
        await conversation_participant.create({ user_id: userBId, conversation_id: newConversation.id });

        res.status(201).json(newConversation);
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}



module.exports = {
    getConversations,
    createConversation
};