'use strict';

import jwt from 'jsonwebtoken';
import { getAccountById, Account } from '../../../db/account';

export type JWTData = {
	accountId: string;
	email: string;
}

export function verifyJwt(token): Promise<JWTData> {
	return new Promise((res, rej) => {
		jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
			if (err != null) {
				res(null);
			} else if (decoded != null) {
				res(decoded);
			} else {
				//Should never get here, but just in case
				rej(new Error('Error validating login token, please contact support.'));
			}
		});
	});
}

export default async function useJWT(req, res, next): Promise<void> {
	let token;
	if (req?.session?.token) {
		res.locals.checkCsrf = true;
		token = req.session.token;
	} else if (req.headers && req.headers['Authorization']?.startsWith('Bearer ')) {
		token = req.headers['Authorization'].substring(7);
	}
	console.log('useJWT token:', token);
	if (token && token.length > 0) {
		try {
			const verifiedToken: JWTData = await verifyJwt(token);
			console.log('useJWT verifiedToken:', verifiedToken);
			if (verifiedToken != null) {
				const account: Account = await getAccountById(verifiedToken.accountId);
				if (account) {
					res.locals.account = {
						_id: account._id.toString(),
						name: account.name,
						email: account.email,
						orgs: account.orgs,
						currentOrg: account.currentOrg,
						currentTeam: account.currentTeam,
					};
					return next();
				}
				req.session.destroy();
			}
		} catch (e) {
			next(e);
		}
	}
  	next();
}
