const express = require('express');
const router = express.Router();
const moment = require('moment');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const requests = require('../helpers/requests');

router.get('/:lockId', (req, res, next) => {
    requests.getLockKeys(req.params.lockId).then(async function (lockKeys) {
        let selectedLock = await requests.getLock(req.params.lockId);
        console.log(selectedLock);
        for (var i = 0; i < lockKeys.length; i++) {
            lockKeys[i]['formattedExpiryTime'] = moment(lockKeys[i].expiryTime).subtract(4, 'hours').format('MM/DD/YYYY HH:mm');
            lockKeys[i]['lastAccessedTime'] = (lockKeys[i].lastUsedTime) ? moment(lockKeys[i].lastUsedTime).subtract(4, 'hours').format('MM/DD/YYYY HH:mm') : 'N/A';
            lockKeys[i].user.phoneNumber = phoneUtil.formatInOriginalFormat(phoneUtil.parse(lockKeys[i].user.phoneNumber, 'US'), 'US');
        }
        res.render('lockInfo', {
            title: 'ShareLock',
            description: 'The lock you can share!',
            userId: 1,
            keys: lockKeys,
            lock: selectedLock
        });
    });
});

module.exports = router;
