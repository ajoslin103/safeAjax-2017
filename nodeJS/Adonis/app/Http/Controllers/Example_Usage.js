'use strict'

const CatLog = require('cat-log')
const log = new CatLog('ThemesController')

const Database = use('Database')

class ThemesController {

	* index (request, response) {

		let { who, now, why, what } = request.authUser.withAccess(2);
		if (why) { response.status(what).send(why); return; }

		const data = yield Database.select('*').from('tbl_themes').orderBy('name', 'asc')
		response.json(data)
	}

	* show (request, response) {

		let { who, now, why, what } = request.authUser.withAccess(2);
		if (why) { response.status(what).send(why); return; }

		const id = request.param('id')
		const data = yield Database.select('*').from('tbl_themes').where('id', id)
		response.json(data)
	}

}

module.exports = ThemesController
