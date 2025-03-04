import NProgress from 'nprogress';

// Account
export function getAccount(dispatch, errorCallback, router) {
	return ApiCall('/account.json', 'GET', null, dispatch, errorCallback, router);
}
export function login(body, dispatch, errorCallback, router) {
	return ApiCall('/forms/account/login', 'POST', body, dispatch, errorCallback, router);
}
export function register(body, dispatch, errorCallback, router) {
	return ApiCall('/forms/account/register', 'POST', body, dispatch, errorCallback, router);
}
export function changePassword(body, dispatch, errorCallback, router) {
	return ApiCall('/forms/account/changepassword', 'POST', body, dispatch, errorCallback, router);
}
export function addAgent(body, dispatch, errorCallback, router) {
	return ApiCall('/forms/agent/add', 'POST', body, dispatch, errorCallback, router);
}
export function addSession(body, dispatch, errorCallback, router) {
	return ApiCall('/forms/session/add', 'POST', body, dispatch, errorCallback, router);
}
export function editAgent(agentId, body, dispatch, errorCallback, router) {
	return ApiCall(`/forms/agent/${agentId}/edit`, 'POST', body, dispatch, errorCallback, router);
}
export function verifyToken(body, dispatch, errorCallback, router) {
	return ApiCall('/forms/account/verify', 'POST', body, dispatch, errorCallback, router);
}
export function getIntegrations(dispatch, errorCallback, router) {
	return ApiCall('/integrations.json', 'GET', null, dispatch, errorCallback, router);
}
export function getHome(body, dispatch, errorCallback, router) {
	return ApiCall(`/${body.resourceSlug}/home.json`, 'GET', null, dispatch, errorCallback, router);
}
export function getSession(body, dispatch, errorCallback, router) {
	return ApiCall(`/${body.resourceSlug}/session/${body.sessionId}.json`, 'GET', null, dispatch, errorCallback, router);
}
export function deleteSession(body, dispatch, errorCallback, router) {
	return ApiCall(`/forms/session/${body.sessionId}`, 'DELETE', body, dispatch, errorCallback, router);
}
export function getMessages(body, dispatch, errorCallback, router) {
	return ApiCall(`/${body.resourceSlug}/session/${body.sessionId}/messages.json`, 'GET', null, dispatch, errorCallback, router);
}
export function getSessions(body, dispatch, errorCallback, router) {
	return ApiCall(`/${body.resourceSlug}/sessions.json`, 'GET', null, dispatch, errorCallback, router);
}
export function getAgent(body, dispatch, errorCallback, router) {
	return ApiCall(`/${body.resourceSlug}/agent/${body.agentId}.json`, 'GET', null, dispatch, errorCallback, router);
}
export function getAgents(body, dispatch, errorCallback, router) {
	return ApiCall(`/${body.resourceSlug}/agents.json`, 'GET', null, dispatch, errorCallback, router);
}
export function switchTeam(body, dispatch, errorCallback, router) {
	return ApiCall('/forms/team/switch', 'POST', body, dispatch, errorCallback, router);
}

function buildOptions(_route, method, body) {

	// Convert method uppercase
	method = method.toUpperCase();
	const options: any = {
		redirect: 'manual',
		method,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('_jwt') || ''}`
		}
	};
	if (body != null) {
		options.body = JSON.stringify(body);
	}

	//TODO: for GETs, use "body" with URLSearchParams and append as url query
	return options;

}

export async function ApiCall(route, method='get', body, dispatch, errorCallback, router, finishProgress=1) {

	// Start progress bar
	NProgress.start();

	// Build request options for fetch
	const requestOptions = buildOptions(route, method, body);

	console.debug(route, requestOptions);

	// Make request, catch errors, and finally{} to always end progress bar
	let response;
	try {
		response = await fetch(route, requestOptions);
	} catch(e) {
		console.error(e);
	} finally {
		if (finishProgress != null) {
			NProgress.set(finishProgress);
		} else {
			NProgress.done(true);
		}
	}

	// Show a generic error if we don't get any response at all
	if (!response) {
		errorCallback && errorCallback('An unexpected error occurred, please contact support.');
		NProgress.done(true);
		return;
	}

	// Process request response
	const contentType = response.headers.get('Content-type');
	if (!contentType) {
		errorCallback && errorCallback('An error occurred');
		NProgress.done(true);
		return;
	}
	if (contentType.startsWith('application/json;')) {
		response = await response.json();
		if (response.token) {
			localStorage.setItem('_jwt', response.token);
		}
		if (response.redirect) {
			return router && router.push(response.redirect, null, { scroll: false });
		} else if (response.error) {
			errorCallback && errorCallback(response.error);
			return;
		}
		dispatch(response);
		return response;
	} else {
		errorCallback && errorCallback('An error occurred');
		NProgress.done(true);
	}

}
