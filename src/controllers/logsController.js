const Logs = require('../models/logs');
const { validationResult } = require('express-validator');

exports.createLog = async(req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return sendJson(res, 422, errors.array());
    // }

    const newLog = {
        ip: req.body.ip,
        location: {
            latitude: req.body.latitude,
            longitude: req.body.longitude
        },
        userId: req.body.userId,
        date: new Date()
    }

    try {
        const log = await Logs.create(newLog);
        sendJson(res, 200, log);
    } catch (err) {
        sendJson(res, 500, err)
    }

}

// All logs
exports.allLogs = async(req, res) => {
    try {
        const logs = await Logs.find();
        return (logs.length > 0) ? sendJson(res, 200, logs) : sendJson(res, 402, "Collection logs is empty");
    } catch (err) {
        return sendJson(res, 500, err);
    }
}

// Retrieve
exports.viewLog = async(req, res) => {
    try {
        const log = await Logs.find({ id: req.params.id });
        return (log.length < 1) ? sendJson(res, 402, "log not found") : sendJson(res, 200, log);
    } catch (err) {
        return sendJson(res, 500, err);
    }
}

// Update (cas ou log not found)
exports.updateLog = async(req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return sendJson(res, 422, errors.array());
    // }

    const updateLog = {
        ip: req.body.ip,
        location: {
            latitude: req.body.latitude,
            longitude: req.body.longitude
        },
        userId: req.body.userId,
        date: new Date()
    }

    try {
        const book = await Logs.findOneAndUpdate({ id: req.params.id }, updateLog, { new: true });
        sendJson(res, 200, "Log updated");
    } catch (err) {
        sendJson(res, 500, err);
    }
}

// Remove a log (manage not log not found)
exports.removeLog = async(req, res) => {
    try {
        await Logs.findOneAndDelete({ id: req.params.id });
        sendJson(res, 200, "Log removed");
    } catch (err) {
        sendJson(res, 500, err);
    }
}

// Remove all logs
exports.removeAllLogs = async(req, res) => {
    try {
        await Logs.deleteMany();
        sendJson(res, 200, "Collection Logs cleared");
    } catch (err) {
        sendJson(res, 500, err);
    }
}

exports.search = async(req, res) => {
    const query = req.query;
    await Logs.apiQuery(query).select("id ip location date").then(log => {
        res.status(201).json(log)
    }).catch(err => {
        res.status(500).json(err)
    });
    // try {
    //     const logs = await Logs.apiQuery(query).select("id ip location date");
    //     res.status(201).json(logs);
    // } catch (err) {
    //     res.status(500).json(err);
    // }
}




const sendJson = (res, code = 200, data = "") => {
    res.status(code);
    // Rappel code 200 OK et code 201 Created
    if (code === 200 || code === 201) {
        return res.json({
            err: false,
            httpCode: code,
            logs: data
        })
    }
    return res.json({
        err: true,
        httpCode: code,
        messageErr: data
    })
}