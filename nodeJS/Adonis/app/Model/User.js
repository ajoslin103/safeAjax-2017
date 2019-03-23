'use strict'

const CatLog = require('cat-log')
const log = new CatLog('User')

const Lucid = use('Lucid')

class User extends Lucid {

	static get table () {
		return 'tbl_users'
	}

	static get primaryKey () {
		return 'userId'
	}

	static get incrementing () {
		return false
	}

	static get hidden () {
		return ['password']
	}

	withAccess(needs) {
		const now = new Date().toUTCString();
		const who = this.original.userId;
		let what = 200;
		let why = '';

		if (! this.original.access) {
			log.debug('Newly registered users must be granted permissions by existing users.')
			why = 'Newly registered users must be granted permissions by existing users.'
			what = 409
		}

		if (needs > this.original.access) {
			log.debug(`You need elevated permissions (> ${needs}) to complete this action.`)
			why = 'You need elevated permissions to complete this action.'
			what = 401
		}

		return { now: now, who: who, why: why, what: what }
	}

}

module.exports = User
