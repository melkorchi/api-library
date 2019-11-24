const Logs = require('../models/logs');
const { validationResult } = require('express-validator');
const iplocation = require("iplocation").default;
const geoip = require('geoip-lite');
const ip = require("ip");
const request = require('request');
const qs = require('qs');
const moment = require('moment');

// const geo = (ip) => {
//     return Promise((resolve, reject) => {
//         try {
//             return iplocation(ip)
//                 .then((res) => {
//                     console.log(res);
//                     resolve(res);
//                 })
//                 .catch(err => {
//                     reject(err);
//                 });
//         } catch (error) {
//             console.log('Failed');
//         }
//     });
// }


exports.createLog = async(req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return sendJson(res, 422, errors.array());
    // }

    const userIP = req.body.ip;
    console.log(userIP);

    const myIp = ip.address();
    console.log(myIp);

    // const data = geo(userIP);
    // console.log(data);

    // What's my ip 91.161.240.34
    // const geo = geoip.lookup(myIp);
    const geo = geoip.lookup(userIP);
    console.log(geo);

    const newLog = {
        ip: req.body.ip,
        location: {
            latitude: (geo) ? geo.ll[0] : null,
            longitude: (geo) ? geo.ll[1] : null
        },
        userId: req.body.userId,
        // date: new Date()
        date: (req.body.date) ? new Date(req.body.date) : new Date()
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

// Reporting
exports.getLogsGroupByUserId = async(req, res) => {
    try {
        const data = await Logs.aggregate([{
            $group: { _id: "$userId", count: { $sum: 1 } }
        }]);
        return (data.length > 0) ? sendJson(res, 200, data) : sendJson(res, 402, "Collection logs is empty");
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
    // console.log(req.params);
    // console.log(req.body);

    const geo = geoip.lookup(req.body.ip);

    // console.log(geo);

    const updateLog = {
        ip: req.body.ip,
        location: {
            latitude: (geo) ? geo.ll[0] : null,
            longitude: (geo) ? geo.ll[1] : null
        },
        userId: req.body.userId,
        date: new Date()
    }

    // console.log(updateLog);

    try {
        const book = await Logs.findOneAndUpdate({ id: req.params.id }, updateLog, { new: true });
        // const book = await Logs.findOneAndUpdate({ id: req.params.id }, updateLog);
        sendJson(res, 200, "Log updated");
    } catch (err) {
        console.log('err', err)
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

exports.searchLogs = async(req, res) => {
    const params = qs.parse(req.query);
    // const params = req.query;

    const ip = params.ip;
    const userId = params.userId;
    let date = params.date;
    let logs = [];
    const validateIPaddress = (ipaddress) => {
        if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
            return (true)
        }
        return (false)
    }
    const changeDateFormat = (inputDate) => { // expects d/m/y
        var splitDate = inputDate.split('/');
        if (splitDate.count == 0) {
            return null;
        }

        var year = splitDate[2];
        var month = splitDate[1];
        var day = splitDate[0];

        return month + '/' + day + '/' + year;
        // return year + '/' + month + '/' + day;
    }

    try {
        if (!ip) {
            logs = await Logs.find();
        } else {
            if (moment(changeDateFormat(date)).isValid()) {
                const dt = moment(changeDateFormat(date)).utc().format("MM/DD/YYYY");
                logs = await Logs.find({
                    "date": {
                        "$gte": new Date(dt),
                        "$lt": new Date(dt).addDays(2)
                    }
                });
            } else if (!validateIPaddress(userId) && Number.isInteger(parseInt(userId))) {
                logs = await Logs.find({ userId: parseInt(userId) });
            } else {
                logs = await Logs.find({ ip: ip });
            }
        }

        return (logs.length < 1) ? sendJson(res, 402, "0 résultat trouvé") : sendJson(res, 200, logs);
    } catch (err) {
        return sendJson(res, 500, err);
    }
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