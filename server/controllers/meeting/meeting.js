const meeting = require('../../model/schema/meeting');
const MeetingHistory = require('../../model/schema/meeting')
const mongoose = require('mongoose');

const add = async (req, res) => {
    try {
        req.body.createdDate = new Date();
        const meet_obj = new meeting(req.body);
        await meet_obj.save();
        res.status(200).json(meet_obj);
    } catch (err) {
        console.error('Failed to create Meeting:', err);
        res.status(400).json({ error: 'Failed to create Meeting' });
    }
}

const index = async (req, res) => {
    const query = req.query
    query.deleted = false;

    let allData = await meeting.find(query).populate({
        path: 'createBy',
        match: { deleted: false }, // Populate only if createBy.deleted is false
        select: 'firstName lastName' // Only retrieve firstName and lastName fields
    }).exec()

    // const result = allData.filter(item => item.createBy !== null);
    const result = allData.filter(item => item.createBy !== null) // Ensure createBy is not null
    .map(item => ({
        ...item._doc, // Spread the existing fields of the item
        createdByName: `${item.createBy.firstName} ${item.createBy.lastName}` // Add the new key
    }));
    res.send(result)
}

const view = async (req, res) => {
    let data = await meeting.findOne({ _id: req.params.id }).populate({
        path: 'createBy',
        select: 'firstName lastName' // Only retrieve firstName and lastName fields
    });
    if (!data) return res.status(404).json({ message: "no Data Found." })
    // Add the new key createdByName
    const createdByName = data.createBy ? `${data.createBy.firstName} ${data.createBy.lastName}` : null;

    // Convert the Mongoose document to a plain object to add the new key
    data = data.toObject();
    data.createdByName = createdByName;
    res.status(200).json({ data })
}

const deleteData = async (req, res) => {
    try {
        const meet_obj = await meeting.findByIdAndUpdate(req.params.id, { deleted: true });
        res.status(200).json({ message: "done", meet_obj })
    } catch (err) {
        res.status(404).json({ message: "error", err })
    }
}

const deleteMany = async (req, res) => {
    try {
        const meet_obj = await meeting.updateMany({ _id: { $in: req.body } }, { $set: { deleted: true } });
        res.status(200).json({ message: "done", meet_obj })
    } catch (err) {
        res.status(404).json({ message: "error", err })
    }
}

module.exports = { add, index, view, deleteData, deleteMany }