const express = require('express');
const router = express.Router();
const requests = require('../helpers/requests');

router.get('/', (req, res, next) => {
  	// get all active locks and include
	requests.getUserLocks(1).then(async function(allLocks) {
		for (var i = 0; i < allLocks.length; i++) {
			let lockKeys = await requests.getLockKeys(allLocks[i].id);
			console.log('lock keys', lockKeys);
			allLocks[i]['keys'] = lockKeys;
			for (var j = 0; j < lockKeys.length; j++) {
				if (allLocks[i].owner.id === lockKeys[j].user.id) {
					allLocks[i]['ownerToken'] = lockKeys[j].token;
					break;
				}
			}
		}
		res.render('index', {
			title: 'ShareLock',
			description: 'The lock you can share!',
			userId: 1,
			locks: allLocks
		});
	})
});

module.exports = router;
